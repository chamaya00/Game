import Foundation

/// Loads the single shared content source (copied into the app bundle from
/// /content at build time by Scripts/sync-content.sh — see ios/README.md).
enum ContentLoader {
    static let content: ContentData = load("roles")
    static let tokens: DesignTokens = load("design-tokens")

    private static func load<T: Decodable>(_ resourceName: String) -> T {
        guard let url = Bundle.main.url(forResource: resourceName, withExtension: "json") else {
            fatalError("""
                Missing \(resourceName).json in the app bundle. \
                Run Scripts/sync-content.sh to copy /content into ios/Matched/Resources before building.
                """)
        }
        do {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            fatalError("Failed to decode \(resourceName).json: \(error)")
        }
    }

    static func role(id: String) -> Role {
        guard let role = content.roles.first(where: { $0.id == id }) else {
            fatalError("Unknown role id: \(id)")
        }
        return role
    }
}
