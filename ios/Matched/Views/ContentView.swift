import SwiftUI

private enum Screen: Equatable {
    case splash
    case orientation
    case list
    case chat(Profile)
    case ending(Profile, EndingResult)
    case epilogue

    static func == (lhs: Screen, rhs: Screen) -> Bool {
        switch (lhs, rhs) {
        case (.splash, .splash), (.orientation, .orientation), (.list, .list), (.epilogue, .epilogue):
            return true
        case let (.chat(a), .chat(b)):
            return a.id == b.id
        case let (.ending(a, ar), .ending(b, br)):
            return a.id == b.id && ar == br
        default:
            return false
        }
    }
}

struct ContentView: View {
    @StateObject private var game = GameState()
    @State private var screen: Screen = .splash
    @State private var showResetConfirm = false

    var body: some View {
        Group {
            switch screen {
            case .splash:
                SplashView(onStart: { screen = game.save.orientation != nil ? .list : .orientation })
            case .orientation:
                OrientationView(onChoose: { orientation in
                    game.save.orientation = orientation
                    screen = .list
                })
            case .list:
                MatchListView(
                    onSelect: { profile in
                        game.selectProfile(profile)
                        screen = .chat(profile)
                    },
                    onOpenEpilogue: { screen = .epilogue },
                    onResetRequested: { showResetConfirm = true }
                )
            case .chat(let profile):
                ChatView(
                    role: ContentLoader.role(id: profile.roleId),
                    gender: profile.gender,
                    onBack: { screen = .list },
                    onFinished: { result in
                        game.recordEnding(roleId: profile.roleId, result: result)
                        screen = .ending(profile, result)
                    }
                )
            case .ending(let profile, let result):
                EndingView(
                    role: ContentLoader.role(id: profile.roleId),
                    gender: profile.gender,
                    result: result,
                    onContinue: { screen = .list }
                )
            case .epilogue:
                EpilogueView(onBack: { screen = .list })
            }
        }
        .environmentObject(game)
        .confirmationDialog(
            "Chơi lại từ đầu? Toàn bộ tiến trình hiện tại sẽ mất.",
            isPresented: $showResetConfirm,
            titleVisibility: .visible
        ) {
            Button("Chơi lại từ đầu", role: .destructive) {
                game.reset()
                screen = .splash
            }
            Button("Huỷ", role: .cancel) {}
        }
    }
}
