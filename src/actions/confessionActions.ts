'use server';

import { createClient, getCurrentUser } from '@/lib/supabaseServer';
import { ConfessionInsert, UnlockType, Gender } from '@/types/database';
import { revalidatePath } from 'next/cache';
import { COIN_PACKAGES } from '@/lib/coinPackages';

const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'unsplash.com',
  'picsum.photos',
  'i.pravatar.cc',
  'randomuser.me',
  'encrypted-tbn0.gstatic.com',
];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
];

function sanitizeImageUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    const host = parsed.hostname.toLowerCase();
    const allowed = ALLOWED_IMAGE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    return allowed ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function pickFallbackImage(): string {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
}

// Response type for actions
interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// =============================================
// MODULE 1: DYNAMIC PRICING
// Pricing constraints: unlock_price 0-100, chat_price 0-50
// =============================================

const PRICING_CONSTRAINTS = {
  unlockPrice: { min: 0, max: 100, default: 10 },
  chatPrice: { min: 0, max: 50, default: 5 },
} as const;

function validatePrice(price: number | undefined, type: 'unlock' | 'chat'): number {
  const constraints = type === 'unlock' ? PRICING_CONSTRAINTS.unlockPrice : PRICING_CONSTRAINTS.chatPrice;
  if (price === undefined || isNaN(price)) return constraints.default;
  return Math.max(constraints.min, Math.min(constraints.max, Math.round(price)));
}

// =============================================
// CONFESSION ACTIONS
// =============================================

interface CreateConfessionInput {
  content: string;
  imageUrl?: string;
  isAnonymous?: boolean;
  gender: Gender;
  age: number;
  // MODULE 1: Dynamic pricing inputs
  unlockPrice?: number;
  chatPrice?: number;
}

export async function createConfession(
  input: CreateConfessionInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để đăng confession / Please login to post confession' };
    }

    const { content, imageUrl, isAnonymous = true, gender, age, unlockPrice, chatPrice } = input;

    // Validation
    if (!content || content.length < 10) {
      return { success: false, error: 'Nội dung phải có ít nhất 10 ký tự / Content must be at least 10 characters' };
    }

    if (content.length > 2000) {
      return { success: false, error: 'Nội dung không được vượt quá 2000 ký tự / Content must not exceed 2000 characters' };
    }

    if (age < 13 || age > 120) {
      return { success: false, error: 'Tuổi phải từ 13 đến 120 / Age must be between 13 and 120' };
    }

    // MODULE 1: Validate and apply pricing
    const validatedUnlockPrice = validatePrice(unlockPrice, 'unlock');
    const validatedChatPrice = validatePrice(chatPrice, 'chat');

    const safeImageUrl = sanitizeImageUrl(imageUrl) || pickFallbackImage();

    const confessionData: ConfessionInsert = {
      author_id: user.id,
      content,
      image_url: safeImageUrl,
      is_anonymous: isAnonymous,
      gender,
      age,
      unlock_price: validatedUnlockPrice,
      chat_price: validatedChatPrice,
    };

    const { data, error } = await supabase
      .from('confessions')
      .insert(confessionData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating confession:', error);
      return { success: false, error: 'Không thể tạo confession / Failed to create confession' };
    }

    revalidatePath('/');
    return { success: true, data: { id: data.id } };
  } catch (error) {
    console.error('Error in createConfession:', error);
    return { success: false, error: 'Có lỗi xảy ra / Something went wrong' };
  }
}

export async function getConfessions(page: number = 1, limit: number = 10) {
  try {
    const supabase = await createClient();
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('confessions')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching confessions:', error);
      return { success: false, error: 'Failed to fetch confessions' };
    }

    return {
      success: true,
      data: {
        confessions: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error('Error in getConfessions:', error);
    return { success: false, error: 'Something went wrong' };
  }
}

export async function getConfessionById(id: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('confessions')
      .select(`
        *,
        author:profiles!confessions_author_id_fkey(id, username, avatar_url)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching confession:', error);
      return { success: false, error: 'Confession not found' };
    }

    // Increment view count
    await supabase
      .from('confessions')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);

    return { success: true, data };
  } catch (error) {
    console.error('Error in getConfessionById:', error);
    return { success: false, error: 'Something went wrong' };
  }
}

// =============================================
// UNLOCK ACTIONS
// =============================================

interface UnlockResult {
  unlockId: string;
  newBalance: number;
  coinsSpent: number;
  alreadyUnlocked?: boolean;
}

export async function unlockContent(
  targetId: string,
  targetType: UnlockType
): Promise<ActionResponse<UnlockResult>> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập / Please login' };
    }

    // Get the confession to determine the cost
    const { data: confession, error: confessionError } = await supabase
      .from('confessions')
      .select('unlock_price, chat_price, author_id')
      .eq('id', targetId)
      .single();

    if (confessionError || !confession) {
      return { success: false, error: 'Không tìm thấy confession / Confession not found' };
    }

    // Determine cost based on type
    const cost = targetType === 'PHOTO' ? confession.unlock_price : confession.chat_price;

    // Call the stored procedure for atomic transaction
    const { data, error } = await supabase.rpc('process_unlock', {
      p_user_id: user.id,
      p_target_id: targetId,
      p_target_type: targetType,
      p_cost: cost,
    });

    if (error) {
      console.error('Error in process_unlock:', error);
      return { success: false, error: 'Không thể mở khóa / Failed to unlock' };
    }

    const result = data as {
      success: boolean;
      error?: string;
      unlock_id?: string;
      new_balance?: number;
      coins_spent?: number;
      already_unlocked?: boolean;
      coins_needed?: number;
      coins_available?: number;
    };

    if (!result.success) {
      if (result.error === 'Insufficient coins') {
        return {
          success: false,
          error: `Không đủ xu! Cần ${result.coins_needed} xu, bạn có ${result.coins_available} xu / Not enough coins! Need ${result.coins_needed}, you have ${result.coins_available}`,
        };
      }
      return { success: false, error: result.error || 'Failed to unlock' };
    }

    // Create or get chat room if unlocking chat
    if (targetType === 'CHAT' && confession.author_id) {
      await getOrCreateChatRoom(user.id, confession.author_id, targetId);
    }

    revalidatePath('/');
    revalidatePath(`/chat/${targetId}`);

    return {
      success: true,
      data: {
        unlockId: result.unlock_id || '',
        newBalance: result.new_balance || 0,
        coinsSpent: result.coins_spent || 0,
        alreadyUnlocked: result.already_unlocked,
      },
    };
  } catch (error) {
    console.error('Error in unlockContent:', error);
    return { success: false, error: 'Có lỗi xảy ra / Something went wrong' };
  }
}

export async function checkUnlockStatus(
  targetId: string,
  targetType: UnlockType
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) return false;

    const { data, error } = await supabase.rpc('has_unlocked', {
      p_user_id: user.id,
      p_target_id: targetId,
      p_target_type: targetType,
    });

    if (error) {
      console.error('Error checking unlock status:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in checkUnlockStatus:', error);
    return false;
  }
}

export async function getUserUnlocks(): Promise<ActionResponse<{
  photos: string[];
  chats: string[];
}>> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('unlocks')
      .select('target_id, target_type')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching unlocks:', error);
      return { success: false, error: 'Failed to fetch unlocks' };
    }

    const photos = data
      ?.filter(u => u.target_type === 'PHOTO')
      .map(u => u.target_id) || [];

    const chats = data
      ?.filter(u => u.target_type === 'CHAT')
      .map(u => u.target_id) || [];

    return {
      success: true,
      data: { photos, chats },
    };
  } catch (error) {
    console.error('Error in getUserUnlocks:', error);
    return { success: false, error: 'Something went wrong' };
  }
}

// =============================================
// CHAT ROOM ACTIONS
// =============================================

async function getOrCreateChatRoom(
  userId: string,
  partnerId: string,
  confessionId: string
) {
  const supabase = await createClient();

  // Check if room exists
  const { data: existingRoom } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('confession_id', confessionId)
    .or(`and(participant_1.eq.${userId},participant_2.eq.${partnerId}),and(participant_1.eq.${partnerId},participant_2.eq.${userId})`)
    .single();

  if (existingRoom) {
    return existingRoom.id;
  }

  // Create new room
  const { data: newRoom, error } = await supabase
    .from('chat_rooms')
    .insert({
      confession_id: confessionId,
      participant_1: userId,
      participant_2: partnerId,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating chat room:', error);
    return null;
  }

  return newRoom?.id;
}

export async function getChatRoomByConfession(confessionId: string) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get confession with author
    const { data: confession, error: confessionError } = await supabase
      .from('confessions')
      .select(`
        *,
        author:profiles!confessions_author_id_fkey(id, username, avatar_url)
      `)
      .eq('id', confessionId)
      .single();

    if (confessionError || !confession) {
      return { success: false, error: 'Confession not found' };
    }

    // Check if chat is unlocked
    const isUnlocked = await checkUnlockStatus(confessionId, 'CHAT');

    if (!isUnlocked && confession.author_id !== user.id) {
      return { success: false, error: 'Chat not unlocked' };
    }

    // Get or create chat room
    const partnerId = confession.author_id === user.id
      ? user.id // Self chat (shouldn't happen but handle it)
      : confession.author_id;

    if (!partnerId) {
      return { success: false, error: 'Cannot chat with anonymous confession without author' };
    }

    // Get partner profile
    const { data: partner } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', partnerId)
      .single();

    return {
      success: true,
      data: {
        confession,
        partner,
        currentUserId: user.id,
        partnerId,
      },
    };
  } catch (error) {
    console.error('Error in getChatRoomByConfession:', error);
    return { success: false, error: 'Something went wrong' };
  }
}

// =============================================
// PROFILE ACTIONS
// =============================================

export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { success: false, error: 'Profile not found' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getCurrentProfile:', error);
    return { success: false, error: 'Something went wrong' };
  }
}

export async function updateProfile(updates: {
  username?: string;
  avatar_url?: string;
  gender?: Gender;
  age?: number;
}) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate username if updating
    if (updates.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single();

      if (existing) {
        return { success: false, error: 'Username already taken' };
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: 'Failed to update profile' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return { success: false, error: 'Something went wrong' };
  }
}

// =============================================
// TRANSACTION ACTIONS
// =============================================

export async function getTransactionHistory(page: number = 1, limit: number = 20) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching transactions:', error);
      return { success: false, error: 'Failed to fetch transactions' };
    }

    return {
      success: true,
      data: {
        transactions: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error('Error in getTransactionHistory:', error);
    return { success: false, error: 'Something went wrong' };
  }
}

// =============================================
// MODULE 2: ADVANCED MOCK PAYMENT
// Simulates payment gateway with success/failure scenarios
// =============================================

// Coin packages imported at top of file

interface TopUpResult {
  newBalance: number;
  coinsAdded: number;
}

/**
 * Simulated Top-up Action with Mock Payment Gateway
 * 
 * LOGIC EXPLANATION:
 * 1. User selects a coin package
 * 2. System simulates network delay (1.5-2s) to mimic real payment processing
 * 3. TEST LOGIC:
 *    - If coins < 500: Simulates SUCCESS → Adds coins to user balance
 *    - If coins >= 500: Simulates FAILURE → Returns mock bank error
 * 
 * This allows developers to test both success and failure UI flows
 * without integrating a real payment gateway.
 * 
 * In production: Replace this with actual payment gateway integration
 * (Stripe, VNPay, MoMo, etc.)
 */
export async function topUpCoins(
  packageId: string
): Promise<ActionResponse<TopUpResult>> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập / Please login' };
    }

    // Find the selected package
    const selectedPackage = COIN_PACKAGES.find(pkg => pkg.id === packageId);
    if (!selectedPackage) {
      return { success: false, error: 'Gói xu không hợp lệ / Invalid package' };
    }

    const amount = selectedPackage.coins;

    // ===============================================
    // MOCK PAYMENT GATEWAY SIMULATION
    // ===============================================

    // Simulate network delay (1.5 - 2 seconds)
    // This is done server-side to ensure fair testing
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));

    // TEST LOGIC: Fail for large packages to test error UI
    if (amount >= 500) {
      // Simulate bank/gateway rejection
      return {
        success: false,
        error: `🚫 Giao dịch thất bại: Ngân hàng từ chối (Mã lỗi: E404)\n` +
          `⚠️ Đây là tính năng test UI lỗi - Chọn gói nhỏ hơn để test thành công.\n\n` +
          `🚫 Transaction failed: Bank declined (Error: E404)\n` +
          `⚠️ This is a test feature for error UI - Choose a smaller package to test success.`,
      };
    }

    // ===============================================
    // SUCCESS FLOW: Add coins to user balance
    // ===============================================

    const { data, error } = await supabase.rpc('add_coins', {
      p_user_id: user.id,
      p_amount: amount,
    });

    if (error) {
      console.error('Error updating coins via add_coins:', error);
      return { success: false, error: 'Không thể nạp xu / Failed to top up' };
    }

    const result = data as { success: boolean; new_balance?: number; error?: string } | null;
    if (!result?.success || typeof result.new_balance !== 'number') {
      return { success: false, error: result?.error || 'Không thể nạp xu / Failed to top up' };
    }

    revalidatePath('/');

    return {
      success: true,
      data: {
        newBalance: result.new_balance,
        coinsAdded: amount,
      }
    };
  } catch (error) {
    console.error('Error in topUpCoins:', error);
    return { success: false, error: 'Có lỗi xảy ra / Something went wrong' };
  }
}

// =============================================
// MODULE 3: TRUST & SAFETY - REPORT ACTIONS
// =============================================

type ReportReason =
  | 'OFFENSIVE_CONTENT'
  | 'SCAM'
  | 'EXPLICIT_IMAGE'
  | 'HARASSMENT'
  | 'SPAM'
  | 'OTHER';

interface ReportInput {
  confessionId: string;
  reason: ReportReason;
  description?: string;
}

interface ReportResult {
  reportId: string;
}

/**
 * Report a confession for policy violations
 * - Creates a report record
 * - Automatically hides the confession from the reporter's feed
 */
export async function reportConfession(
  input: ReportInput
): Promise<ActionResponse<ReportResult>> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Bạn cần đăng nhập để báo cáo / Please login to report' };
    }

    const { confessionId, reason, description } = input;

    // Validate confession exists
    const { data: confession, error: confessionError } = await supabase
      .from('confessions')
      .select('id')
      .eq('id', confessionId)
      .single();

    if (confessionError || !confession) {
      return { success: false, error: 'Không tìm thấy bài viết / Post not found' };
    }

    // Check if already reported by this user
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('target_id', confessionId)
      .single();

    if (existingReport) {
      return { success: false, error: 'Bạn đã báo cáo bài viết này / You already reported this post' };
    }

    // Create report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        target_id: confessionId,
        reason,
        description: description || null,
      })
      .select('id')
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      // If report table doesn't exist yet, just hide the confession
      await hideConfessionForUser(user.id, confessionId);
      return { success: true, data: { reportId: 'pending' } };
    }

    // Hide the confession from user's feed
    await hideConfessionForUser(user.id, confessionId);

    return { success: true, data: { reportId: report.id } };
  } catch (error) {
    console.error('Error in reportConfession:', error);
    return { success: false, error: 'Có lỗi xảy ra / Something went wrong' };
  }
}

/**
 * Hide a confession from a specific user's feed
 */
async function hideConfessionForUser(userId: string, confessionId: string): Promise<void> {
  const supabase = await createClient();

  try {
    await supabase
      .from('hidden_confessions')
      .insert({
        user_id: userId,
        confession_id: confessionId,
      })
      .single();
  } catch (error) {
    // Table might not exist yet, that's okay
    console.log('Hidden confessions table not available, skipping hide operation');
  }
}

/**
 * Get list of confession IDs hidden by the current user
 */
export async function getHiddenConfessions(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from('hidden_confessions')
      .select('confession_id')
      .eq('user_id', user.id);

    if (error) {
      // Table might not exist yet
      return [];
    }

    return data?.map(h => h.confession_id) || [];
  } catch {
    return [];
  }
}

/**
 * Unhide a confession for the current user
 */
export async function unhideConfession(confessionId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('hidden_confessions')
      .delete()
      .eq('user_id', user.id)
      .eq('confession_id', confessionId);

    if (error) {
      console.error('Error unhiding confession:', error);
      return { success: false, error: 'Failed to unhide' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in unhideConfession:', error);
    return { success: false, error: 'Something went wrong' };
  }
}
