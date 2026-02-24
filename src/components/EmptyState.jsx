import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
    return (
        <div className="w-full flex-1 min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-white/10 bg-gray-950/20">
            <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-white/10 flex items-center justify-center text-gray-400 mb-6 shadow-xl">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    );
}
