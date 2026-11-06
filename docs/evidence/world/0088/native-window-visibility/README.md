# Native minimized-window visibility capability

Verdict **INCONCLUSIVE / capability unavailable in this runtime**. No App suspension, resume, clock or no-catch-up PASS is claimed.

On2026-11-06, after parent performance all-clear, inspected the attached managed cloud runtime. Chromium and Xorg are installed. `Xvfb`, `xvfb-run`, Xwayland, weston, fluxbox, openbox and xdotool were not found on PATH; executable-file inspection also found no Xvfb in /usr/bin, /usr/local/bin or /opt/codex. DISPLAY and WAYLAND_DISPLAY are unset; no /tmp/.X11-unix socket exists. Environment status declares remote-desktop capability enabled but state unknown, with no callable desktop NodeREPL startup tool exposed. Declaration alone does not prove a running display server.

The tiny headful Chromium attempt failed before creating a page. Native browser output reports `Missing X server or $DISPLAY` and platform initialization failure. The failed Chromium process exited and its temporary profile was cleaned. No server or port5490 was used. No package was installed, no display configuration changed, and no production file edited.

`probe.mjs` is ready for a runtime that has a native display. It opens only about:blank, records genuine visibilitychange/document.hidden, gets the native window through CDP Browser.getWindowForTarget, requests minimized and then normal window states, and accepts capability only if both hidden and visible states/events are observed. It does not override document.hidden, emulate page focus, substitute lifecycle events, or use CSS hiding. Playwright background-throttling-disabling default arguments are removed so a future run preserves native background behaviour. Visibility waits are bounded to5seconds each.

The latest failed launch is retained in capability-result.json and launch.log. States are empty and capabilityProven is false. The script exits cleanly to retain evidence; that exit code is not a passing capability assertion.

Because the prerequisite failed, no current-App source was selected or executed. In particular, no older e898 head is represented as383 or current. Once a real display/Xvfb is provisioned through the supported runtime path, rerun the blank-page probe first; only a proven native visibility flip justifies an exact-current-head App paint/clock suspend/resume/no-catch-up test.

Run from repository root with an already available display:

```
/workspace/.junyan-tools/node_modules/node/bin/node docs/evidence/world/0088/native-window-visibility/probe.mjs
```
