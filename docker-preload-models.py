import sys

import argostranslate.package
import argostranslate.translate


def main() -> int:
    wanted_pairs = {("en", "fr"), ("fr", "en")}

    print("Updating Argos package index...")
    argostranslate.package.update_package_index()
    available = argostranslate.package.get_available_packages()

    by_pair = {(pkg.from_code, pkg.to_code): pkg for pkg in available}
    missing = sorted(pair for pair in wanted_pairs if pair not in by_pair)
    if missing:
        print(f"Missing language packages in index: {missing}", file=sys.stderr)
        return 1

    installed = set()
    for lang in argostranslate.translate.get_installed_languages():
        for tr in lang.translations_from:
            installed.add((lang.code, tr.to_lang.code))

    for pair in sorted(wanted_pairs):
        if pair in installed:
            print(f"Model already installed: {pair[0]}->{pair[1]}")
            continue

        pkg = by_pair[pair]
        print(f"Installing model: {pair[0]}->{pair[1]}")
        pkg.install()

    print("Model preload complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
