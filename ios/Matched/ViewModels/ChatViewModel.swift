import Foundation
import Combine

enum Speaker { case npc, system, player }

struct DisplayMessage: Identifiable {
    let id = UUID()
    var speaker: Speaker
    var text: String
    var effect: String?
    var recalled: Bool = false
}

enum PendingChoiceKind {
    case flavor([FlavorOption])
    case midpoint([BranchOption])
    case final_([FinalOption])
}

/// Walks a role's beat list the same way web/src/screens/Chat.tsx does:
/// dialogue plays out with a typing delay, choice beats pause the queue
/// until the player picks an option, and picking a flavor/midpoint choice
/// splices its response/branch back onto the front of the queue.
final class ChatViewModel: ObservableObject {
    @Published var log: [DisplayMessage] = []
    @Published var typing = false
    @Published var pendingChoice: PendingChoiceKind?
    @Published var glitching = false
    @Published var finished: EndingResult?

    let role: Role
    let gender: Gender
    private var queue: [Beat]

    var name: String { gender == .female ? role.variants.female.name : role.variants.male.name }

    init(role: Role, gender: Gender) {
        self.role = role
        self.gender = gender
        self.queue = role.beats
    }

    func start() {
        guard log.isEmpty, finished == nil else { return }
        processNext()
    }

    private func processNext() {
        guard pendingChoice == nil, finished == nil, !queue.isEmpty else { return }
        let beat = queue.removeFirst()

        switch beat {
        case .flavorChoice(let fc):
            pendingChoice = .flavor(fc.options)

        case .midpointChoice(let mc):
            if let prompt = mc.prompt {
                showNpc(NpcBeat(text: prompt, clue: nil, effect: nil)) { [weak self] in
                    self?.pendingChoice = .midpoint(mc.options)
                }
            } else {
                pendingChoice = .midpoint(mc.options)
            }

        case .finalChoice(let fc):
            if let prompt = fc.prompt {
                showNpc(NpcBeat(text: prompt, clue: nil, effect: nil)) { [weak self] in
                    self?.pendingChoice = .final_(fc.options)
                }
            } else {
                pendingChoice = .final_(fc.options)
            }

        case .system(let s):
            log.append(DisplayMessage(speaker: .system, text: s.text.interpolated(name: name)))
            processNext()

        case .npc(let n):
            showNpc(n, completion: nil)
        }
    }

    private func showNpc(_ beat: NpcBeat, completion: (() -> Void)?) {
        typing = true
        let tokens = ContentLoader.tokens.animation
        let delayMs = beat.effect == "typing_long" ? (tokens["typingLongMs"] ?? 2800) : (tokens["typingDefaultMs"] ?? 1000)

        DispatchQueue.main.asyncAfter(deadline: .now() + delayMs / 1000) { [weak self] in
            guard let self else { return }
            self.typing = false
            let text = beat.text.interpolated(name: self.name)

            if beat.effect == "glitch_subtle" {
                self.glitching = true
                let glitchMs = tokens["glitchSubtleMs"] ?? 90
                DispatchQueue.main.asyncAfter(deadline: .now() + glitchMs / 1000) {
                    self.glitching = false
                }
            }

            let displayEffect = beat.effect == "typing_long" ? nil : beat.effect
            let message = DisplayMessage(speaker: .npc, text: text, effect: displayEffect)
            self.log.append(message)

            if beat.effect == "message_recalled" {
                let flashMs = tokens["messageRecalledFlashMs"] ?? 400
                DispatchQueue.main.asyncAfter(deadline: .now() + flashMs / 1000) {
                    guard let idx = self.log.firstIndex(where: { $0.id == message.id }) else { return }
                    self.log[idx].text = "Tin nhắn đã được thu hồi."
                    self.log[idx].recalled = true
                }
            }

            if let completion {
                completion()
            } else {
                self.processNext()
            }
        }
    }

    func chooseFlavor(_ option: FlavorOption) {
        log.append(DisplayMessage(speaker: .player, text: option.text))
        pendingChoice = nil
        queue.insert(.npc(NpcBeat(text: option.response, clue: nil, effect: nil)), at: 0)
        processNext()
    }

    func chooseMidpoint(_ option: BranchOption) {
        log.append(DisplayMessage(speaker: .player, text: option.text))
        pendingChoice = nil
        queue.insert(contentsOf: option.branch, at: 0)
        processNext()
    }

    func chooseFinal(_ option: FinalOption) {
        log.append(DisplayMessage(speaker: .player, text: option.text))
        pendingChoice = nil
        finished = option.leadsTo == "good" ? .good : .bad
    }
}
