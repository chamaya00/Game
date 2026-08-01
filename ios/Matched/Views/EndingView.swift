import SwiftUI

struct EndingView: View {
    let role: Role
    let gender: Gender
    let result: EndingResult
    let onContinue: () -> Void
    var lang: Lang = .vi

    @State private var revealed = 0

    private var block: EndingBlock { result == .good ? role.goodEnding : role.badEnding }
    private var name: String { gender == .female ? role.variants.female.name : role.variants.male.name }

    var body: some View {
        VStack(spacing: 10) {
            Text(result == .good ? "GOOD ENDING" : "BAD ENDING")
                .font(.caption)
                .tracking(2)
                .foregroundColor(Palette.textMuted)
            Text(block.title.rendered(lang, name: name))
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(Palette.accentPrimary)
                .padding(.bottom, 16)

            VStack(spacing: 8) {
                ForEach(0..<revealed, id: \.self) { i in
                    beatView(block.beats[i])
                }
            }

            if revealed >= block.beats.count {
                Button("Quay lại danh sách", action: onContinue)
                    .buttonStyle(PrimaryButtonStyle())
                    .padding(.top, 16)
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Palette.bgPrimary)
        .onAppear { revealNext() }
    }

    private func revealNext() {
        guard revealed < block.beats.count else { return }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) {
            revealed += 1
            revealNext()
        }
    }

    @ViewBuilder
    private func beatView(_ beat: Beat) -> some View {
        switch beat {
        case .system(let s):
            Text(s.text.rendered(lang, name: name))
                .font(.caption)
                .italic()
                .foregroundColor(Palette.textMuted)
                .multilineTextAlignment(.center)
        case .npc(let n):
            Text(n.text.rendered(lang, name: name))
                .font(.system(size: 14))
                .padding(10)
                .background(Palette.bubbleNpc)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        default:
            EmptyView()
        }
    }
}
