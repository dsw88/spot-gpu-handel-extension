# spot-gpu-handel-extension
Handel extension that provides a spot GPU instance

# Usage
To use this extension, add it to the `extensions` section of your Handel file, then add the `spotgpu` service to your environment:

```yaml
version: 1

name: my-instance # Replace with your app name here

extensions: # This tells Handel to import this extension
  gpu: spot-gpu-handel-extension # The value is the NPM package name of this extension. The key is a short name you can use to reference it in your Handel file.

environments:
  dev:
    instance:
      type: gpu::spotgpu # You must use the <extensionName>::<serviceType> syntax here
      key_name: my-keypair # Required. You can create this in the EC2 console
      volume_size: 100 # Optional. Size in GB of the instance disk to use. Default: 75. Minimum: 75
```
