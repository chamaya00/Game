import SwiftUI

extension Color {
    init(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        s.removeAll { $0 == "#" }
        var value: UInt64 = 0
        Scanner(string: s).scanHexInt64(&value)
        let r = Double((value >> 16) & 0xFF) / 255
        let g = Double((value >> 8) & 0xFF) / 255
        let b = Double(value & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}

/// Static mirror of /content/design-tokens.json's color palette (section 10.2),
/// since SwiftUI can't read the JSON tokens at view-declaration time as easily
/// as the web app's CSS variables. Keep these in sync with design-tokens.json.
enum Palette {
    static let bgPrimary = Color(hex: "#FFF6EF")
    static let bgCard = Color(hex: "#FFFFFF")
    static let accentPrimary = Color(hex: "#FF9EB5")
    static let accentSecondary = Color(hex: "#FFD59E")
    static let bubbleNpc = Color(hex: "#F1ECFF")
    static let bubblePlayer = Color(hex: "#FFE3EA")
    static let textPrimary = Color(hex: "#4A3B3B")
    static let textMuted = Color(hex: "#A99B96")
    static let onlineDot = Color(hex: "#7ED9A6")
}
