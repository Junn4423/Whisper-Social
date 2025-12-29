'use client';

import React from 'react';
import { Coins, Info } from 'lucide-react';

interface PriceSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    hint?: string;
    icon?: React.ReactNode;
    colorTheme?: 'purple' | 'gold' | 'pink';
}

export function PriceSlider({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    hint,
    icon,
    colorTheme = 'purple',
}: PriceSliderProps) {
    const colorMap = {
        purple: {
            track: 'from-neon-purple to-neon-pink',
            thumb: 'border-neon-purple shadow-neon',
            text: 'text-neon-purple',
            bg: 'bg-neon-purple/20',
        },
        gold: {
            track: 'from-gold to-gold-dark',
            thumb: 'border-gold shadow-gold',
            text: 'text-gold',
            bg: 'bg-gold/20',
        },
        pink: {
            track: 'from-neon-pink to-pink-400',
            thumb: 'border-neon-pink',
            text: 'text-neon-pink',
            bg: 'bg-neon-pink/20',
        },
    };

    const colors = colorMap[colorTheme];
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    {icon || <Coins className="w-4 h-4" />}
                    {label}
                </label>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${colors.bg}`}>
                    <Coins className={`w-4 h-4 ${colors.text}`} />
                    <span className={`font-bold ${colors.text}`}>{value}</span>
                    <span className="text-gray-400 text-sm">xu</span>
                </div>
            </div>

            {/* Slider Container */}
            <div className="relative pt-1">
                {/* Track Background */}
                <div className="relative h-2 rounded-full bg-dark-200/50 overflow-hidden">
                    {/* Active Track */}
                    <div
                        className={`absolute h-full rounded-full bg-gradient-to-r ${colors.track} transition-all duration-150`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Custom Slider Input */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value, 10))}
                    className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                    style={{ margin: 0 }}
                />

                {/* Custom Thumb */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 ${colors.thumb} transition-all duration-150 pointer-events-none`}
                    style={{ left: `calc(${percentage}% - 10px)` }}
                />
            </div>

            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs text-gray-500">
                <span>{min} xu</span>
                <span>{max} xu</span>
            </div>

            {/* Hint */}
            {hint && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-neon-purple/5 border border-neon-purple/20">
                    <Info className="w-4 h-4 text-neon-purple mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-400 leading-relaxed">{hint}</p>
                </div>
            )}
        </div>
    );
}

export default PriceSlider;
