{
  description = "Development environment for App zum Doc";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      lib = nixpkgs.lib;
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forAllSystems = lib.genAttrs systems;
      metadata = builtins.fromJSON (builtins.readFile ./apps/mobile/build-metadata.json);
      nodeMajor = metadata.node;
      pnpmVersion = metadata.pnpm;
      javaVersion = metadata.android.java;
    in
    {
      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt);

      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};

          nodejs =
            let
              candidate = pkgs."nodejs_${nodeMajor}";
            in
            lib.throwIfNot (lib.versions.major candidate.version == nodeMajor)
              "build-metadata.json pins node ${nodeMajor} but nodejs_${nodeMajor} is ${candidate.version}"
              candidate;

          jdk = pkgs."jdk${javaVersion}";
        in
        {
          default = pkgs.mkShell {
            packages = [
              nodejs
              jdk
              pkgs.android-tools
              pkgs.git
              pkgs.gh
              pkgs.jq
              pkgs.yq-go
              pkgs.curl
            ]
            ++ lib.optional (lib.meta.availableOn pkgs.stdenv.hostPlatform pkgs.fdroidserver) pkgs.fdroidserver;

            JAVA_HOME = "${jdk}";

            shellHook = ''
              export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
              export COREPACK_HOME="''${XDG_CACHE_HOME:-$HOME/.cache}/app-zum-doc/corepack"
              mkdir -p "$COREPACK_HOME/bin"
              corepack enable --install-directory "$COREPACK_HOME/bin"
              corepack prepare pnpm@${pnpmVersion} --activate
              export PATH="$COREPACK_HOME/bin:$PATH"
            '';
          };
        }
      );
    };
}
