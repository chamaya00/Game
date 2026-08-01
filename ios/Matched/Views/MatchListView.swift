import SwiftUI

struct MatchListView: View {
    @EnvironmentObject var game: GameState
    let onSelect: (Profile) -> Void
    let onOpenEpilogue: () -> Void
    let onResetRequested: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("💗 \(ContentLoader.tokens.appName)")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(Palette.accentPrimary)
                Spacer()
                Button(action: onResetRequested) {
                    Image(systemName: "gearshape.fill")
                }
            }
            .padding(20)

            if game.epilogueReady {
                Button(action: onOpenEpilogue) {
                    Text("Tất cả 8 kết nối đã hoàn thành — xem điều gì đang chờ đợi →")
                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(14)
                        .background(Palette.accentSecondary)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 8)
            }

            Text("\(game.completedCount)/8 match đã hoàn thành")
                .font(.caption)
                .foregroundColor(Palette.textMuted)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 20)
                .padding(.bottom, 8)

            ScrollView {
                LazyVStack(spacing: 10) {
                    ForEach(game.profiles()) { profile in
                        Button(action: { onSelect(profile) }) {
                            ProfileCard(profile: profile, ending: game.save.completedEndings[profile.roleId])
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 24)
            }
        }
        .background(Palette.bgPrimary)
    }
}

private struct ProfileCard: View {
    let profile: Profile
    let ending: EndingResult?

    var body: some View {
        HStack(spacing: 14) {
            Circle()
                .fill(Color(hex: profile.accentColor))
                .frame(width: 56, height: 56)
                .overlay(
                    Text(String(profile.name.prefix(1)))
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                )

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(profile.name).font(.system(size: 15, weight: .bold, design: .rounded))
                    if let ending {
                        Text(ending == .good ? "✓" : "◐")
                            .font(.system(size: 10))
                            .frame(width: 18, height: 18)
                            .background(Palette.bubbleNpc)
                            .clipShape(Circle())
                    }
                }
                Text(profile.profileHook.rendered(.vi, name: profile.name))
                    .font(.system(size: 12))
                    .foregroundColor(Palette.textMuted)
                    .lineLimit(1)
                HStack(spacing: 5) {
                    Circle().fill(Palette.onlineDot).frame(width: 7, height: 7)
                    Text("Đang hoạt động").font(.system(size: 11)).foregroundColor(Palette.textMuted)
                }
            }
            Spacer()
        }
        .padding(14)
        .background(Palette.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .shadow(color: Palette.textPrimary.opacity(0.06), radius: 10, y: 2)
    }
}
