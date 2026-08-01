import SwiftUI

struct EpilogueView: View {
    @EnvironmentObject var game: GameState
    let onBack: () -> Void

    var body: some View {
        let epilogue = game.selectedEpilogue()
        let results = Array(game.save.completedEndings.values)
        let good = results.filter { $0 == .good }.count
        let bad = results.filter { $0 == .bad }.count

        VStack(spacing: 10) {
            Text("\(good) tốt · \(bad) xấu")
                .font(.caption)
                .foregroundColor(Palette.textMuted)
            Text(epilogue.title.text(.vi))
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(Palette.accentPrimary)
                .padding(.bottom, 16)

            VStack(spacing: 8) {
                ForEach(epilogue.beats.indices, id: \.self) { i in
                    if case .system(let s) = epilogue.beats[i] {
                        Text(s.text.text(.vi))
                            .font(.system(size: 14))
                            .multilineTextAlignment(.center)
                    }
                }
            }

            Button("Quay lại danh sách", action: onBack)
                .buttonStyle(PrimaryButtonStyle())
                .padding(.top, 16)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Palette.bgPrimary)
    }
}
