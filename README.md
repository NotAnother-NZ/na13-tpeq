# Feedback Template

## Description
This repository contains a feedback template to integrate with Marker.io for collecting user feedback on your Webflow projects.

<br>

## Usage

### Installation
To integrate the feedback template with your Webflow project, follow these steps:

1. Copy the provided code snippet.

2. Paste the code snippet into the custom code section of your Webflow site settings. Ensure that you place it inside the `<head>` tag.

```html
<script>
if (window.location.hostname.includes("webflow.io")) {
  window.markerConfig = {
    project: 'YOUR PROJECT ID',
    source: 'snippet'
  };

!function(e,r,a){if(!e.__Marker){e.__Marker={};var t=[],n={__cs:t};["show","hide","isVisible","capture","cancelCapture","unload","reload","isExtensionInstalled","setReporter","setCustomData","on","off"].forEach(function(e){n[e]=function(){var r=Array.prototype.slice.call(arguments);r.unshift(e),t.push(r)}}),e.Marker=n;var s=r.createElement("script");s.async=1,s.src="https://edge.marker.io/latest/shim.js";var i=r.getElementsByTagName("script")[0];i.parentNode.insertBefore(s,i)}}(window,document);
}
</script>
```

3. Replace `'YOUR PROJECT ID'` in the code snippet with your actual project ID. 

OR

4. Open your project on Marker.io and navigate to the installation page (`/widget/installation/snippet`). Copy the code provided by Marker.io and nest it within the conditional statement `if (window.location.hostname.includes("webflow.io")) { }`.

<br>

### Usage Instructions
Once the code snippet is added to your Webflow project, the feedback template will be enabled. Users can provide feedback by clicking on the feedback button and following the instructions provided.

<br>

### Project ID
You can find your project ID in the URL after opening the respective project on Marker.io.

For example:
```html
https://app.marker.io/projects/661833d3f3f7dt137fa633a9933/feedback/all
```
Here, `661833d3f3f7dt137fa633a9933` is the project ID.

