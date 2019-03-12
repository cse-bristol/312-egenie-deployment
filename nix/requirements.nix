# generated using pypi2nix tool (version: 1.8.1)
# See more at: https://github.com/garbas/pypi2nix
#
# COMMAND:
#   pypi2nix -V 3.6 -r egenie/src/egenie/requirements.txt -E mariadb zlib openssl pkgconfig libjpeg openjpeg libtiff freetype lcms2 libwebp tcl ncurses
#

{ pkgs ? import <nixpkgs> {}
}:

let

  inherit (pkgs) makeWrapper;
  inherit (pkgs.stdenv.lib) fix' extends inNixShell;

  pythonPackages =
  import "${toString pkgs.path}/pkgs/top-level/python-packages.nix" {
    inherit pkgs;
    inherit (pkgs) stdenv;
    python = pkgs.python36;
    # patching pip so it does not try to remove files when running nix-shell
    overrides =
      self: super: {
        bootstrapped-pip = super.bootstrapped-pip.overrideDerivation (old: {
          patchPhase = old.patchPhase + ''
            sed -i               -e "s|paths_to_remove.remove(auto_confirm)|#paths_to_remove.remove(auto_confirm)|"                -e "s|self.uninstalled = paths_to_remove|#self.uninstalled = paths_to_remove|"                  $out/${pkgs.python35.sitePackages}/pip/req/req_install.py
          '';
        });
      };
  };

  commonBuildInputs = with pkgs; [ glibcLocales mariadb zlib openssl pkgconfig libjpeg openjpeg libtiff freetype lcms2 libwebp tcl ncurses pythonPackages.setuptools_scm pythonPackages.nose ];
  commonDoCheck = false;

  withPackages = pkgs':
    let
      pkgs = builtins.removeAttrs pkgs' ["__unfix__"];
      interpreter = pythonPackages.buildPythonPackage {
        name = "python36-interpreter";
        buildInputs = [ makeWrapper ] ++ (builtins.attrValues pkgs);
        buildCommand = ''
          mkdir -p $out/bin
          ln -s ${pythonPackages.python.interpreter}               $out/bin/${pythonPackages.python.executable}
          for dep in ${builtins.concatStringsSep " "               (builtins.attrValues pkgs)}; do
            if [ -d "$dep/bin" ]; then
              for prog in "$dep/bin/"*; do
                if [ -f $prog ]; then
                  ln -s $prog $out/bin/`basename $prog`
                fi
              done
            fi
          done
          for prog in "$out/bin/"*; do
            wrapProgram "$prog" --prefix PYTHONPATH : "$PYTHONPATH"
          done
          pushd $out/bin
          ln -s ${pythonPackages.python.executable} python
          ln -s ${pythonPackages.python.executable}               python3
          popd
        '';
        passthru.interpreter = pythonPackages.python;
      };
    in {
      __old = pythonPackages;
      inherit interpreter;
      mkDerivation = x : pythonPackages.buildPythonPackage (x // {LC_ALL="en_US.utf-8";});
      packages = pkgs;
      overrideDerivation = drv: f:
        pythonPackages.buildPythonPackage (drv.drvAttrs // f drv.drvAttrs //                                            { meta = drv.meta; });
      withPackages = pkgs'':
        withPackages (pkgs // pkgs'');
    };

  python = withPackages {};

  generated = self: {

    "Django" = python.mkDerivation {
      name = "Django-1.11";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/79/43/ed9ca4d69f35b5e64f2ecad73f75a8529a9c6f0d562e5af9a1f65beda355/Django-1.11.tar.gz"; sha256 = "b6f3b864944276b4fd1d099952112696558f78b77b39188ac92b6c5e80152c30"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [
      self."pytz"
    ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://www.djangoproject.com/";
        license = licenses.bsdOriginal;
        description = "A high-level Python Web framework that encourages rapid development and clean, pragmatic design.";
      };
    };



    "Pillow" = python.mkDerivation {
      name = "Pillow-5.3.0";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/1b/e1/1118d60e9946e4e77872b69c58bc2f28448ec02c99a2ce456cd1a272c5fd/Pillow-5.3.0.tar.gz"; sha256 = "2ea3517cd5779843de8a759c2349a3cd8d3893e03ab47053b66d5ec6f8bc4f93"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://python-pillow.org";
        license = "License :: Other/Proprietary License";
        description = "Python Imaging Library (Fork)";
      };
    };



    "Unidecode" = python.mkDerivation {
      name = "Unidecode-0.4.21";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/0e/26/6a4295c494e381d56bba986893382b5dd5e82e2643fc72e4e49b6c99ce15/Unidecode-0.04.21.tar.gz"; sha256 = "280a6ab88e1f2eb5af79edff450021a0d3f0448952847cd79677e55e58bad051"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "";
        license = licenses.gpl2Plus;
        description = "ASCII transliterations of Unicode text";
      };
    };



    "Whoosh" = python.mkDerivation {
      name = "Whoosh-2.7.4";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/25/2b/6beed2107b148edc1321da0d489afc4617b9ed317ef7b72d4993cad9b684/Whoosh-2.7.4.tar.gz"; sha256 = "7ca5633dbfa9e0e0fa400d3151a8a0c4bec53bd2ecedc0a67705b17565c31a83"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://bitbucket.org/mchaput/whoosh";
        license = licenses.bsdOriginal;
        description = "Fast, pure-Python full text indexing, search, and spell checking library.";
      };
    };



    "django-crispy-forms" = python.mkDerivation {
      name = "django-crispy-forms-1.6.1";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/ef/f3/511b017c2cc3923bc3b317111fa230b0497d12ae3a9ed4c8c2237c07aef1/django-crispy-forms-1.6.1.tar.gz"; sha256 = "c894f3a44e111ae6c6226c67741d96d120adb942de41dc8b2a991b87de7ff9c0"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://github.com/maraujop/django-crispy-forms";
        license = licenses.mit;
        description = "Best way to have Django DRY forms";
      };
    };



    "django-djconfig" = python.mkDerivation {
      name = "django-djconfig-0.8.0";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/74/71/3c741d405a9cb84bbd2cc71c97c7ad2cc90605df9fae888a4b77e108ef49/django-djconfig-0.8.0.tar.gz"; sha256 = "61b7f64b875533893937293de4f42857662368ea54fbb291016d4174f161e5a2"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://github.com/nitely/django-djconfig";
        license = licenses.mit;
        description = "DjConfig is a Django app for storing dynamic configurations.";
      };
    };



    "django-extensions" = python.mkDerivation {
      name = "django-extensions-1.9.1";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/3b/8d/d3fb06ce03df3500f10c0a991e1418d75edeee3d4e483b4ae5eaf35a54f7/django-extensions-1.9.1.tar.gz"; sha256 = "b562fd29acbf5d9b18a1c8605f1009719357b739e3a869a4bd4c7be223ace1cc"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [
      self."six"
    ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://github.com/django-extensions/django-extensions";
        license = licenses.mit;
        description = "Extensions for Django";
      };
    };



    "django-haystack" = python.mkDerivation {
      name = "django-haystack-2.8.1";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/69/43/3e247b7b2134b48e9a53fb387e191e5e05b5f38f2faf78ca892097c2b441/django-haystack-2.8.1.tar.gz"; sha256 = "8b54bcc926596765d0a3383d693bcdd76109c7abb6b2323b3984a39e3576028c"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [
      self."Django"
    ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://haystacksearch.org/";
        license = licenses.bsdOriginal;
        description = "Pluggable search for Django.";
      };
    };



    "django-infinite-scroll-pagination" = python.mkDerivation {
      name = "django-infinite-scroll-pagination-0.2.0";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/a3/54/f2e0d4c8c14ff90de641c0b41435a18ffd564db140da5d06b5f59c3f2c1a/django-infinite-scroll-pagination-0.2.0.tar.gz"; sha256 = "8cfd3a63350888fa95a0e4cf43db5794ef0ca75544391543fc89be5f83abb053"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://github.com/nitely/django-infinite-scroll-pagination";
        license = licenses.mit;
        description = "infinite-scroll-pagination is a Django app that implements the *seek method* for scalable pagination..";
      };
    };



    "django-ipware" = python.mkDerivation {
      name = "django-ipware-1.1.6";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/94/c6/b08db9d173eb87fef85301b48b8202d969f36aad332f25e85abf7e6ce733/django-ipware-1.1.6.tar.gz"; sha256 = "93a90f9dd8caf2c633172aa8c8ba4e76e2b44f92a6942fa35e7624281e81ea03"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://github.com/un33k/django-ipware";
        license = licenses.mit;
        description = "A Django utility application that returns client's real IP address";
      };
    };



    "django-spirit" = python.mkDerivation {
      name = "django-spirit-0.7.1b0";
      src = pkgs.fetchgit { url = "https://github.com/nitely/Spirit.git"; sha256 = "0jlvgm6m0iklwrs3yxnb3alhadiswp9qvwkiyjaky760r6nx1gpd"; rev = "f4c9efe534768b6762c8640ffb7ff9d10fdd289a"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [
      self."Django"
      self."Pillow"
      self."Whoosh"
      self."django-djconfig"
      self."django-haystack"
      self."django-infinite-scroll-pagination"
      self."mistune"
      self."olefile"
      self."python-magic"
      self."pytz"
    ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://spirit-project.com/";
        license = licenses.mit;
        description = "Spirit is a Python based forum powered by Django.";
      };
    };



    "mistune" = python.mkDerivation {
      name = "mistune-0.8.4";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/2d/a4/509f6e7783ddd35482feda27bc7f72e65b5e7dc910eca4ab2164daf9c577/mistune-0.8.4.tar.gz"; sha256 = "59a3429db53c50b5c6bcc8a07f8848cb00d7dc8bdb431a4ab41920d201d4756e"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://github.com/lepture/mistune";
        license = licenses.bsdOriginal;
        description = "The fastest markdown parser in pure Python";
      };
    };



    "mysqlclient" = python.mkDerivation {
      name = "mysqlclient-1.3.12";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/6f/86/bad31f1c1bb0cc99e88ca2adb7cb5c71f7a6540c1bb001480513de76a931/mysqlclient-1.3.12.tar.gz"; sha256 = "2d9ec33de39f4d9c64ad7322ede0521d85829ce36a76f9dd3d6ab76a9c8648e5"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://github.com/PyMySQL/mysqlclient-python";
        license = licenses.gpl1;
        description = "Python interface to MySQL";
      };
    };



    "numpy" = python.mkDerivation {
      name = "numpy-1.13.3";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/bf/2d/005e45738ab07a26e621c9c12dc97381f372e06678adf7dc3356a69b5960/numpy-1.13.3.zip"; sha256 = "36ee86d5adbabc4fa2643a073f93d5504bdfed37a149a3a49f4dde259f35a750"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://www.numpy.org";
        license = licenses.bsdOriginal;
        description = "NumPy: array processing for numbers, strings, records, and objects.";
      };
    };



    "olefile" = python.mkDerivation {
      name = "olefile-0.45.1";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/d3/8a/e0f0e56d6a542dd987f9290ef7b5164636ee597ce8c2932c19c78292d5ec/olefile-0.45.1.zip"; sha256 = "2b6575f5290de8ab1086f8c5490591f7e0885af682c7c1793bdaf6e64078d385"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://www.decalage.info/python/olefileio";
        license = licenses.bsdOriginal;
        description = "Python package to parse, read and write Microsoft OLE2 files (Structured Storage or Compound Document, Microsoft Office) - Improved version of the OleFileIO module from PIL, the Python Image Library.";
      };
    };



    "python-magic" = python.mkDerivation {
      name = "python-magic-0.4.13";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/65/0b/c6b31f686420420b5a16b24a722fe980724b28d76f65601c9bc324f08d02/python-magic-0.4.13.tar.gz"; sha256 = "604eace6f665809bebbb07070508dfa8cabb2d7cb05be9a56706c60f864f1289"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://github.com/ahupp/python-magic";
        license = licenses.mit;
        description = "File type identification using libmagic";
      };
    };



    "pytz" = python.mkDerivation {
      name = "pytz-2017.2";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/a4/09/c47e57fc9c7062b4e83b075d418800d322caa87ec0ac21e6308bd3a2d519/pytz-2017.2.zip"; sha256 = "f5c056e8f62d45ba8215e5cb8f50dfccb198b4b9fbea8500674f3443e4689589"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://pythonhosted.org/pytz";
        license = licenses.mit;
        description = "World timezone definitions, modern and historical";
      };
    };



    "six" = python.mkDerivation {
      name = "six-1.11.0";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/16/d8/bc6316cf98419719bd59c91742194c111b6f2e85abac88e496adefaf7afe/six-1.11.0.tar.gz"; sha256 = "70e8a77beed4562e7f14fe23a786b54f6296e34344c23bc42f07b15018ff98e9"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://pypi.python.org/pypi/six/";
        license = licenses.mit;
        description = "Python 2 and 3 compatibility utilities";
      };
    };



    "sorl-thumbnail" = python.mkDerivation {
      name = "sorl-thumbnail-12.3";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/b8/a3/821819f989712a06cc6c1c7b31d417052e1d27f0e5ff414f460532d90063/sorl-thumbnail-12.3.tar.gz"; sha256 = "ce91c5b112a2ef930a09625adbd99682bd62f34be1963c28f3ffc0d0138a07fd"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://github.com/mariocesar/sorl-thumbnail";
        license = licenses.bsdOriginal;
        description = "Thumbnails for Django";
      };
    };



    "uWSGI" = python.mkDerivation {
      name = "uWSGI-2.0.18";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/e7/1e/3dcca007f974fe4eb369bf1b8629d5e342bb3055e2001b2e5340aaefae7a/uwsgi-2.0.18.tar.gz"; sha256 = "4972ac538800fb2d421027f49b4a1869b66048839507ccf0aa2fda792d99f583"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://uwsgi-docs.readthedocs.io/en/latest/";
        license = licenses.gpl2Plus;
        description = "The uWSGI server";
      };
    };



    "uni-slugify" = python.mkDerivation {
      name = "uni-slugify-0.1.4";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/34/2c/ee0f4735bcf77b5965ef07c2c366544632ca152f190e6ffaf4bcb1cd1310/uni-slugify-0.1.4.tar.gz"; sha256 = "8fc8ea1ba697ccdb8404b5f383f2f0fb1b4ec581cb7239154a45acd720e76332"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [
      self."Unidecode"
      self."six"
    ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://github.com/nitely/unicode-slugify";
        license = licenses.bsdOriginal;
        description = "A slug generator that turns strings into unicode slugs.";
      };
    };



    "unicode-slugify" = python.mkDerivation {
      name = "unicode-slugify-0.1.3";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/8c/ba/1a05f61c7fd72df85ae4dc1c7967a3e5a4b6c61f016e794bc7f09b2597c0/unicode-slugify-0.1.3.tar.gz"; sha256 = "34cf3afefa6480efe705a4fc0eaeeaf7f49754aec322ba3e8b2f27dc1cbcf650"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [
      self."Unidecode"
      self."six"
    ];
      meta = with pkgs.stdenv.lib; {
        homepage = "http://github.com/mozilla/unicode-slugify";
        license = licenses.bsdOriginal;
        description = "A slug generator that turns strings into unicode slugs.";
      };
    };



    "xxtea" = python.mkDerivation {
      name = "xxtea-1.1.0";
      src = pkgs.fetchurl { url = "https://files.pythonhosted.org/packages/99/31/a7eedd7cb2c0d4eaab83047ce61ab6c1b532cb99df20262dad8e56071b97/xxtea-1.1.0.tar.gz"; sha256 = "e4447678d5e020515036f8d925fb70629962d1b72bcd5dfe62b4489e222a8356"; };
      doCheck = commonDoCheck;
      buildInputs = commonBuildInputs;
      propagatedBuildInputs = [ ];
      meta = with pkgs.stdenv.lib; {
        homepage = "https://github.com/ifduyue/xxtea";
        license = licenses.bsdOriginal;
        description = "xxtea";
      };
    };

  };
  localOverridesFile = ./requirements_override.nix;
  overrides = import localOverridesFile { inherit pkgs python; };
  commonOverrides = [

  ];
  allOverrides =
    (if (builtins.pathExists localOverridesFile)
     then [overrides] else [] ) ++ commonOverrides;

in python.withPackages
   (fix' (pkgs.lib.fold
            extends
            generated
            allOverrides
         )
   )
