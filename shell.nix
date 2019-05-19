with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "node-env";
  buildInputs = [
    nodejs-10_x
    (yarn.override { nodejs = nodejs-10_x; })
  ];
}
