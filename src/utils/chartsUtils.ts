export const chartPalette = ['#FACC15', '#22D3EE', '#34D399', '#A78BFA', '#F472B6', '#60A5FA']

export function pickColor(index: number) {
    return chartPalette[index % chartPalette.length]
}

