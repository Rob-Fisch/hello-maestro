
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export const WebDatePicker = ({ date, onChange }: { date: string, onChange: (d: string) => void }) => {
    return (
        <View className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm w-full h-[50px] justify-center relative">
            {/* Native Input: Visible, Transparent Background, fills container */}
            <input
                type="date"
                value={date}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => {
                    try {
                        if (typeof e.currentTarget.showPicker === 'function') {
                            e.currentTarget.showPicker();
                        }
                    } catch (err) {
                        // Ignore
                    }
                }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    paddingLeft: 16,
                    paddingRight: 40, // Space for icon
                    fontSize: 16,
                    border: 'none',
                    background: 'transparent',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    color: '#0f172a',
                    zIndex: 10,
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none'
                }}
            />
            {/* Icon Decoration */}
            <View className="absolute right-3 top-0 bottom-0 justify-center pointer-events-none" style={{ zIndex: 5 }}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
            </View>
        </View>
    );
};

export const WebTimePicker = ({ value, onChange }: { value: string, onChange: (t: string) => void }) => {
    // Value format: "HH:MM" (24h)
    const [h24, m] = value ? value.split(':').map(Number) : [20, 0]; // Default 8PM
    const isPM = h24 >= 12;
    const h12 = h24 % 12 || 12;

    const updateTime = (newH12: number, newM: number, newIsPM: boolean) => {
        let finalH = newH12;
        if (newIsPM && finalH < 12) finalH += 12;
        if (!newIsPM && finalH === 12) finalH = 0;

        const timeString = `${finalH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
        onChange(timeString);
    };

    return (
        <View className="flex-row gap-2 w-full">
            {/* Hour Picker */}
            <View className="flex-1 relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-[50px]">
                <select
                    value={h12}
                    onChange={(e) => updateTime(parseInt(e.target.value), m, isPM)}
                    style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer', zIndex: 10
                    }}
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                </select>
                <View className="flex-1 items-center justify-center pointer-events-none">
                    <Text className="font-bold text-lg text-slate-800">{h12}</Text>
                </View>
            </View>

            <Text className="self-center font-black text-slate-300">:</Text>

            {/* Minute Picker */}
            <View className="flex-1 relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-[50px]">
                <select
                    value={m}
                    onChange={(e) => updateTime(h12, parseInt(e.target.value), isPM)}
                    style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer', zIndex: 10
                    }}
                >
                    {Array.from({ length: 12 }, (_, i) => i * 5).map(min => (
                        <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
                    ))}
                </select>
                <View className="flex-1 items-center justify-center pointer-events-none">
                    <Text className="font-bold text-lg text-slate-800">{m.toString().padStart(2, '0')}</Text>
                </View>
            </View>

            {/* AM/PM Picker */}
            <View className="w-20 relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-[50px]">
                <select
                    value={isPM ? 'PM' : 'AM'}
                    onChange={(e) => updateTime(h12, m, e.target.value === 'PM')}
                    style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer', zIndex: 10
                    }}
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
                <View className="flex-1 items-center justify-center pointer-events-none bg-slate-100">
                    <Text className="font-black text-sm text-slate-600">{isPM ? 'PM' : 'AM'}</Text>
                </View>
            </View>
        </View>
    );
};
