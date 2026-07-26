import Foundation

// MARK: - Dialogue beats
//
// Mirrors the shared schema in /content/roles.json (see web/src/types.ts for
// the TypeScript twin of this same shape). `Beat` is a polymorphic union
// discriminated by a "type" string, so it needs a manual Decodable init.

struct NpcBeat: Decodable {
    let text: String
    let clue: Bool?
    let effect: String? // "typing_long" | "message_recalled" | "glitch_subtle"
}

struct SystemBeat: Decodable {
    let text: String
}

struct FlavorOption: Decodable {
    let text: String
    let response: String
}

struct FlavorChoiceBeat: Decodable {
    let options: [FlavorOption]
}

struct BranchOption: Decodable {
    let text: String
    let branch: [Beat]
}

struct MidpointChoiceBeat: Decodable {
    let prompt: String?
    let options: [BranchOption]
}

struct FinalOption: Decodable {
    let text: String
    let leadsTo: String // "good" | "bad"
}

struct FinalChoiceBeat: Decodable {
    let prompt: String?
    let options: [FinalOption]
}

enum Beat: Decodable {
    case npc(NpcBeat)
    case system(SystemBeat)
    case flavorChoice(FlavorChoiceBeat)
    case midpointChoice(MidpointChoiceBeat)
    case finalChoice(FinalChoiceBeat)

    private enum CodingKeys: String, CodingKey { case type }
    private enum Kind: String, Decodable {
        case npc, system
        case flavor_choice
        case midpoint_choice
        case final_choice
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        switch try container.decode(Kind.self, forKey: .type) {
        case .npc: self = .npc(try NpcBeat(from: decoder))
        case .system: self = .system(try SystemBeat(from: decoder))
        case .flavor_choice: self = .flavorChoice(try FlavorChoiceBeat(from: decoder))
        case .midpoint_choice: self = .midpointChoice(try MidpointChoiceBeat(from: decoder))
        case .final_choice: self = .finalChoice(try FinalChoiceBeat(from: decoder))
        }
    }
}

struct EndingBlock: Decodable {
    let title: String
    let beats: [Beat]
}

struct RoleVariant: Decodable {
    let name: String
}

struct RoleVariants: Decodable {
    let female: RoleVariant
    let male: RoleVariant
}

struct Role: Decodable, Identifiable {
    let id: String
    let order: Int
    let accentColor: String
    let variants: RoleVariants
    let profileHook: String
    let vibe: String
    let horrorType: String
    let mysteryRole: String
    let plantClueTag: String
    let beats: [Beat]
    let goodEnding: EndingBlock
    let badEnding: EndingBlock
}

struct BigMystery: Decodable {
    let missingPersonName: String
    let location: String
    let recurringPhrase: String
    let yearsAgo: Int
    let epiloguePremise: String
}

struct Epilogue: Decodable {
    let id: String
    let title: String
    let condition: String
    let beats: [Beat]
}

struct Epilogues: Decodable {
    let mostlyGood: Epilogue
    let mostlyBad: Epilogue
    let balanced: Epilogue
}

struct ContentData: Decodable {
    let bigMystery: BigMystery
    let roles: [Role]
    let epilogues: Epilogues
}

struct DesignTokens: Decodable {
    let appName: String
    let colors: [String: String]
    let radius: [String: Double]
    let fonts: [String: String]
    let animation: [String: Double]
    let roleAccents: [String: String]
}
