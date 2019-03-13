{ config, pkgs, ... }:

let
  dependencies = import ./packages.nix;
  get-dependencies =
     # for some reason, we have to manually smash in setuptools_scm and setuptools
     # not sure why these are not required by requirements - maybe because they are
     # dev dependencies?
     pkgs: pyPkgs: [pyPkgs.setuptools_scm pyPkgs.setuptools] ++
     (builtins.attrValues (dependencies { pkgs = pkgs; pythonPackages = pyPkgs; }));
  egenie-src = ../src/egenie;
  egenie-sock = "/run/uwsgi/egenie.sock";
  python-with-deps = pkgs.python36.withPackages (get-dependencies pkgs);
  egenie-management-script =
  (pkgs.writeScriptBin "egenie-manage" ''
     export DJANGO_SETTINGS_MODULE=egenie.settings.production
     export MYSQL_DATABASE=egenie
     ${python-with-deps}/bin/python ${egenie-src}/manage.py "$@"
     '');
in {
  networking.firewall.allowedTCPPorts = [80];

  services.nginx = {
    enable = true;
    recommendedGzipSettings = true;
    recommendedOptimisation = true;
    recommendedProxySettings = true;
    recommendedTlsSettings = true;

    appendHttpConfig = ''
    server {
      listen 80 default_server;
      location /static/ {
          autoindex on;
          alias /static/;
      }
  
      location /media/ {
          autoindex on;
          alias /media/;
      }

      location / {
        uwsgi_pass unix://${egenie-sock};
      }
    }
    '';
  };

  environment.systemPackages =
    [python-with-deps egenie-management-script
    
     # Bodge the manage.py script into PATH everywhere
     
    ];

  services.mysql = {
    enable = true;
    package = pkgs.mysql;
    initialDatabases = [{name="egenie";}];
    initialScript =
    pkgs.writeText "ct.sql"
    ''
    GRANT ALL PRIVILEGES ON egenie.* TO 'egenie'@'localhost' IDENTIFIED BY 'egenie';
    '';
  };

  nixpkgs.overlays = [
  (self: super: {
    uwsgi = super.uwsgi.override {
      python3 = python-with-deps;
    };
    })
  ];

  systemd.services.app-start = {
    path = [egenie-management-script];
    script = ''
      rm -rf /static
      egenie-manage collectstatic --noinput
      egenie-manage migrate --run-syncdb --noinput || true
      egenie-manage migrate --noinput

      # TODO ALTER TABLE sd_store_sensorreading ADD KEY ix1(sensor_id, channel_id, timestamp, id, value);
    '';
    requires = ["mysql.service"];
    before = ["uwsgi.service"];
    wantedBy = ["uwsgi.service"];
  };

  services.uwsgi = {
    enable = true;

    # be nginx so we can read the socket from nginx easily
    user = "nginx";
    group = "nginx";
    
    plugins = ["python3"];
    instance = {
      type = "normal";
        master = true;
        processes = 4;
        threads = 2;
        chdir = "${egenie-src}";
        wsgi-file = "${egenie-src}/egenie/wsgi.py";
        socket = egenie-sock;
        env = [
            "DJANGO_SETTINGS_MODULE=egenie.settings.production"
            "MYSQL_DATABASE=egenie"
            # Need to set pythonhome for uwsgi, since otherwise it
            # makes up its own one.
            "PYTHONHOME=${python-with-deps}"
        ];
    };
  };
}
