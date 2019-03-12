{
  egenie = {...} : {
    deployment.targetEnv = "libvirtd";
    deployment.libvirtd.imageDir = "/pool/nixops";
    deployment.libvirtd.headless = true;
    deployment.libvirtd.memorySize = 1024;
    deployment.libvirtd.networks = [ "default" "cse-internal" ];
  };
}
