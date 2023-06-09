class Colors {
    constructor() {
        this.serverColor = "#e8b2f5"; // PastelLavender
        this.list = [
            "#FF7F50", // Coral
            "#6A5ACD", // SlateBlue
            "#FFD700", // Gold
            "#40E0D0", // Turquoise
            "#FF69B4", // HotPink
            "#3CB371", // MediumSeaGreen
            "#9370DB", // MediumPurple
            "#FFA500", // Orange
            "#008080", // Teal
            "#DA70D6", // Orchid
            "#FF4500", // OrangeRed
            "#1E90FF", // DodgerBlue
            "#FFC0CB", // Pink
            "#7B68EE", // MediumSlateBlue
            "#FF8C00", // DarkOrange
            "#00BFFF", // DeepSkyBlue
            "#FF6347", // Tomato
            "#2E8B57", // SeaGreen
            "#9932CC", // DarkOrchid
            "#FF0000", // Red
            "#228B22", // ForestGreen
            "#8A2BE2", // BlueViolet
            "#FF1493", // DeepPink
            "#00FF00", // Lime
            "#8B4513", // SaddleBrown
            "#0000FF", // Blue
            "#FFFF00", // Yellow
            "#7FFF00", // Chartreuse
            "#800080", // Purple
            "#FF00FF", // Magenta
            "#ADFF2F", // GreenYellow
            "#F08080", // LightCoral
            "#00FFFF", // Aqua
            "#FFA07A", // LightSalmon
            "#2F4F4F", // DarkSlateGray
            "#FFB6C1", // LightPink
            "#4B0082", // Indigo
            "#F0E68C", // Khaki
            "#006400", // DarkGreen
            "#B22222", // FireBrick
            "#00CED1", // DarkTurquoise
            "#FFFAF0", // FloralWhite
            "#D2691E", // Chocolate
            "#00FA9A", // MediumSpringGreen
            "#E6E6FA", // Lavender
            "#F5DEB3"  // Wheat
        ];
    }

    randomColor() {
        return this.list[~~(Math.random() * this.list.length)];
    }
}

module.exports = Colors;