import SwiftUI

struct OrientationView: View {
    let onChoose: (Orientation) -> Void

    var body: some View {
        VStack(spacing: 20) {
            Text("Bạn muốn kết nối với...")
                .font(.system(size: 20, weight: .semibold, design: .rounded))
            VStack(spacing: 14) {
                Button("Thích nam") { onChoose(.male) }
                    .buttonStyle(PrimaryButtonStyle())
                Button("Thích nữ") { onChoose(.female) }
                    .buttonStyle(PrimaryButtonStyle())
                Button("Cả hai") { onChoose(.both) }
                    .buttonStyle(PrimaryButtonStyle(secondary: true))
            }
            .frame(maxWidth: .infinity)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Palette.bgPrimary)
    }
}
