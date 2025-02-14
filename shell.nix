{
  pkgs ? import <nixpkgs> { },
}:

let
  bunPackage = pkgs.stdenv.mkDerivation {
    name = "bun";
    version = "1.2.2";

    src = pkgs.fetchurl {
      url = "https://github.com/oven-sh/bun/releases/download/bun-v1.2.2/bun-linux-x64-baseline.zip";
      sha256 = "sha256-ytd1am7hbzQyoyj4Aj/FzUMRBoIurPptbTr7rW/cJNs==";
    };

    nativeBuildInputs = [ pkgs.unzip ];

    sourceRoot = ".";

    installPhase = ''
      mkdir -p $out/bin
      unzip -o $src
      chmod +x bun-linux-x64-baseline/bun
      mv bun-linux-x64-baseline/bun $out/bin/
    '';
  };
in
pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.typescript
    nodePackages.typescript-language-server
    bunPackage
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"
  '';
}
