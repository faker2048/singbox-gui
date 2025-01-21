{
  description = "Development environment for Tauri app with Node.js";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, rust-overlay, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };
        
        # 系统特定的依赖
        nativeBuildInputs = with pkgs; [
          pkg-config
          cmake
          curl
          wget
          openssl
          glib
          gtk3
          libsoup_3
          webkitgtk_4_1
          librsvg
          dbus
          # 其他系统依赖...
        ];

      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js 和 pnpm
            nodejs_22
            nodePackages.pnpm
            
            # Rust 工具链
            (rust-bin.stable.latest.default.override {
              extensions = [ "rust-src" "rust-analyzer" "clippy" ];
            })
            cargo-tauri
            
            # 系统依赖
          ] ++ nativeBuildInputs;

          shellHook = ''
            echo "进入开发环境..."
            echo "Node.js 版本: $(node --version)"
            echo "pnpm 版本: $(pnpm --version)"
            echo "Rust 版本: $(rustc --version)"
            echo "Tauri 版本: $(cargo tauri -V)"
          '';
        };
      }
    );
} 