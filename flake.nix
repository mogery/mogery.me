{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    gitignore = {
        url = "github:hercules-ci/gitignore.nix";
        inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, gitignore, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in rec {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [ nodejs git ];
          shellHook = ''
            npm install
          '';
        };

        packages.default = pkgs.buildNpmPackage {
            name = "mogery.me";
            src = gitignore.lib.gitignoreSource ./.;
            npmDepsHash = "sha256-LqPTCqkI2r08gQJtbmLINczrkjVxZ13KWeUo2dEKsIo=";
            buildInputs = with pkgs; [ nodejs ];
            installPhase = ''
                mkdir $out
                npm run build
                cp -r dist/* $out
            '';
        };
      }
    );
}
