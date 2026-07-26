import SwiftUI

struct SplashView: View {
    let onStart: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            Text("💗").font(.system(size: 64))
            Text(ContentLoader.tokens.appName)
                .font(.system(size: 40, weight: .bold, design: .rounded))
                .foregroundColor(Palette.accentPrimary)
            Text("Kết nối thật sự, ngay từ lần chạm đầu tiên.")
                .foregroundColor(Palette.textMuted)
                .padding(.bottom, 24)
            Button(action: onStart) {
                Text("Bắt đầu")
            }
            .buttonStyle(PrimaryButtonStyle())
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Palette.bgPrimary)
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    var secondary: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold, design: .rounded))
            .foregroundColor(.white)
            .padding(.vertical, 16)
            .padding(.horizontal, 32)
            .background(secondary ? Palette.accentSecondary : Palette.accentPrimary)
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .opacity(configuration.isPressed ? 0.85 : 1)
    }
}
