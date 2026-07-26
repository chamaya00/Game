import Foundation

enum Orientation: String, Codable { case male, female, both }
enum Gender: String, Codable { case female, male }
enum EndingResult: String, Codable { case good, bad }

struct Profile: Identifiable {
    var id: String { roleId + "-" + gender.rawValue }
    let roleId: String
    let gender: Gender
    let name: String
    let accentColor: String
    let profileHook: String
    let order: Int
}

struct SaveData: Codable {
    var orientation: Orientation?
    var completedEndings: [String: EndingResult] = [:]
    var playedGender: [String: Gender] = [:]
    var epilogueSeen: Bool = false
}

/// Root app state: orientation, save data, persistence. Mirrors
/// web/src/lib/storage.ts + web/src/data/content.ts's buildProfileList.
final class GameState: ObservableObject {
    private static let defaultsKey = "matched.save.v1"

    @Published var save: SaveData {
        didSet { persist() }
    }

    init() {
        if let data = UserDefaults.standard.data(forKey: Self.defaultsKey),
           let decoded = try? JSONDecoder().decode(SaveData.self, from: data) {
            save = decoded
        } else {
            save = SaveData()
        }
    }

    private func persist() {
        guard let data = try? JSONEncoder().encode(save) else { return }
        UserDefaults.standard.set(data, forKey: Self.defaultsKey)
    }

    func reset() {
        UserDefaults.standard.removeObject(forKey: Self.defaultsKey)
        save = SaveData()
    }

    func selectProfile(_ profile: Profile) {
        save.playedGender[profile.roleId] = profile.gender
    }

    func recordEnding(roleId: String, result: EndingResult) {
        save.completedEndings[roleId] = result
    }

    /// Builds the playable profile list. In "both" mode, a role shows both
    /// gender variants until one is matched, then only the matched variant
    /// remains — the sibling represents the same role in the mystery and
    /// can't be played twice in one playthrough (GDD section 2.0).
    func profiles() -> [Profile] {
        guard let orientation = save.orientation else { return [] }
        var result: [Profile] = []

        for role in ContentLoader.content.roles {
            let genders: [Gender]
            switch orientation {
            case .both:
                if let played = save.playedGender[role.id] {
                    genders = [played]
                } else {
                    genders = [.female, .male]
                }
            case .male:
                genders = [.male]
            case .female:
                genders = [.female]
            }

            for gender in genders {
                let variant = gender == .female ? role.variants.female : role.variants.male
                result.append(Profile(
                    roleId: role.id,
                    gender: gender,
                    name: variant.name,
                    accentColor: role.accentColor,
                    profileHook: role.profileHook,
                    order: role.order
                ))
            }
        }

        return result.sorted { $0.order < $1.order }
    }

    var completedCount: Int { save.completedEndings.count }
    var epilogueReady: Bool { completedCount >= 8 }

    func selectedEpilogue() -> Epilogue {
        let results = Array(save.completedEndings.values)
        let good = results.filter { $0 == .good }.count
        let bad = results.filter { $0 == .bad }.count
        if good >= 6 { return ContentLoader.content.epilogues.mostlyGood }
        if bad >= 6 { return ContentLoader.content.epilogues.mostlyBad }
        return ContentLoader.content.epilogues.balanced
    }
}

extension String {
    /// Replaces the `{name}` placeholder used throughout the shared script content.
    func interpolated(name: String) -> String {
        replacingOccurrences(of: "{name}", with: name)
    }
}
