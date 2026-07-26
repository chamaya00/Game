import SwiftUI

struct ChatView: View {
    @StateObject private var viewModel: ChatViewModel
    let onBack: () -> Void
    let onFinished: (EndingResult) -> Void

    init(role: Role, gender: Gender, onBack: @escaping () -> Void, onFinished: @escaping (EndingResult) -> Void) {
        _viewModel = StateObject(wrappedValue: ChatViewModel(role: role, gender: gender))
        self.onBack = onBack
        self.onFinished = onFinished
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 8) {
                        ForEach(viewModel.log) { message in
                            MessageBubbleView(message: message)
                                .id(message.id)
                        }
                        if viewModel.typing {
                            TypingBubble()
                        }
                    }
                    .padding(16)
                }
                .onChange(of: viewModel.log.count) { _ in
                    if let last = viewModel.log.last {
                        withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                    }
                }
            }

            if let choice = viewModel.pendingChoice {
                ChoiceBar(choice: choice, viewModel: viewModel)
            }
        }
        .background(Palette.bgPrimary)
        .onAppear { viewModel.start() }
        .onChange(of: viewModel.finished) { result in
            if let result { onFinished(result) }
        }
    }

    private var header: some View {
        HStack(spacing: 12) {
            Button(action: onBack) {
                Image(systemName: "chevron.left")
            }
            Circle()
                .fill(Color(hex: viewModel.role.accentColor))
                .frame(width: 40, height: 40)
                .overlay(Text(String(viewModel.name.prefix(1))).foregroundColor(.white).fontWeight(.bold))
                .saturation(viewModel.glitching ? 2.0 : 1.0)
                .hueRotation(.degrees(viewModel.glitching ? 40 : 0))
            VStack(alignment: .leading, spacing: 2) {
                Text(viewModel.name).fontWeight(.bold)
                HStack(spacing: 5) {
                    Circle().fill(Palette.onlineDot).frame(width: 7, height: 7)
                    Text("Đang hoạt động").font(.caption2).foregroundColor(Palette.textMuted)
                }
            }
            Spacer()
        }
        .padding(16)
        .background(Palette.bgCard)
    }
}

private struct MessageBubbleView: View {
    let message: DisplayMessage

    var body: some View {
        switch message.speaker {
        case .system:
            Text(message.text)
                .font(.caption)
                .italic()
                .foregroundColor(Palette.textMuted)
                .frame(maxWidth: .infinity)
                .multilineTextAlignment(.center)
        case .npc, .player:
            HStack {
                if message.speaker == .player { Spacer(minLength: 40) }
                Text(message.text)
                    .font(.system(size: 14))
                    .italic(message.recalled)
                    .foregroundColor(message.recalled ? Palette.textMuted : Palette.textPrimary)
                    .padding(.vertical, 12)
                    .padding(.horizontal, 16)
                    .background(message.speaker == .player ? Palette.bubblePlayer : Palette.bubbleNpc)
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                if message.speaker == .npc { Spacer(minLength: 40) }
            }
        }
    }
}

private struct TypingBubble: View {
    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<3, id: \.self) { _ in
                Circle().fill(Palette.textMuted).frame(width: 6, height: 6)
            }
        }
        .padding(.vertical, 14)
        .padding(.horizontal, 18)
        .background(Palette.bubbleNpc)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}

private struct ChoiceBar: View {
    let choice: PendingChoiceKind
    @ObservedObject var viewModel: ChatViewModel

    var body: some View {
        VStack(spacing: 8) {
            switch choice {
            case .flavor(let options):
                ForEach(options.indices, id: \.self) { i in
                    ChoiceButton(text: options[i].text.rendered(viewModel.lang, name: viewModel.name)) { viewModel.chooseFlavor(options[i]) }
                }
            case .midpoint(let options):
                ForEach(options.indices, id: \.self) { i in
                    ChoiceButton(text: options[i].text.rendered(viewModel.lang, name: viewModel.name)) { viewModel.chooseMidpoint(options[i]) }
                }
            case .final_(let options):
                ForEach(options.indices, id: \.self) { i in
                    ChoiceButton(text: options[i].text.rendered(viewModel.lang, name: viewModel.name), accent: true) { viewModel.chooseFinal(options[i]) }
                }
            }
        }
        .padding(16)
        .background(Palette.bgCard)
    }
}

private struct ChoiceButton: View {
    let text: String
    var accent: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(text)
                .font(.system(size: 14))
                .foregroundColor(Palette.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.vertical, 12)
                .padding(.horizontal, 16)
                .overlay(
                    RoundedRectangle(cornerRadius: 24, style: .continuous)
                        .stroke(accent ? Palette.accentSecondary : Palette.accentPrimary, lineWidth: 1.5)
                )
        }
    }
}
