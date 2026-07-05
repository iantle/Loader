#!/usr/bin/env python3
"""Generate PWA icons (pure stdlib, no external deps).

Draws a rounded-square badge with a loader spinner ring. Supersampled 4x
for smooth anti-aliased edges. Outputs PNG files used by the manifest.
"""
import math
import struct
import zlib


def lerp(a, b, t):
    return a + (b - a) * t


def draw_icon(size, path):
    ss = 4  # supersampling factor
    S = size * ss
    # RGBA buffer
    buf = bytearray(4 * S * S)

    cx = cy = S / 2.0
    radius_bg = S / 2.0
    corner = S * 0.22  # rounded corner radius for the squircle-ish badge

    ring_r = S * 0.30       # ring radius (center of stroke)
    ring_w = S * 0.11       # stroke width
    inner = ring_r - ring_w / 2
    outer = ring_r + ring_w / 2

    # gap in the ring (spinner look): draw arc from start to end angle
    gap_start = math.radians(60)
    gap_end = math.radians(300)

    for y in range(S):
        for x in range(S):
            px = x + 0.5
            py = y + 0.5

            # rounded-square coverage
            dx = abs(px - cx)
            dy = abs(py - cy)
            half = S / 2.0
            # distance into the rounded rect
            qx = dx - (half - corner)
            qy = dy - (half - corner)
            if qx < 0 and qy < 0:
                d_rect = -1  # deep inside
            elif qx < 0:
                d_rect = qy - corner
            elif qy < 0:
                d_rect = qx - corner
            else:
                d_rect = math.hypot(qx, qy) - corner

            bg_alpha = 1.0 if d_rect < 0 else 0.0
            if bg_alpha == 0.0:
                continue

            # vertical gradient background (indigo -> violet)
            t = py / S
            r = int(lerp(99, 139, t))
            g = int(lerp(102, 92, t))
            b = int(lerp(241, 246, t))

            # spinner ring overlay (white)
            dist = math.hypot(px - cx, py - cy)
            ring_cov = 0.0
            if inner - 1 <= dist <= outer + 1:
                ang = math.atan2(py - cy, px - cx)
                if ang < 0:
                    ang += 2 * math.pi
                in_arc = gap_start <= ang <= gap_end
                # soft cap at the leading end for a tapered look
                if in_arc:
                    # radial anti-alias
                    edge = min(dist - inner, outer - dist)
                    ring_cov = max(0.0, min(1.0, edge + 0.5))

            if ring_cov > 0:
                r = int(lerp(r, 255, ring_cov))
                g = int(lerp(g, 255, ring_cov))
                b = int(lerp(b, 255, ring_cov))

            i = 4 * (y * S + x)
            buf[i] = r
            buf[i + 1] = g
            buf[i + 2] = b
            buf[i + 3] = 255

    # downsample ss x ss -> size
    out = bytearray(4 * size * size)
    for y in range(size):
        for x in range(size):
            ar = ag = ab = aa = 0
            for oy in range(ss):
                for ox in range(ss):
                    sx = x * ss + ox
                    sy = y * ss + oy
                    i = 4 * (sy * S + sx)
                    a = buf[i + 3]
                    ar += buf[i] * a
                    ag += buf[i + 1] * a
                    ab += buf[i + 2] * a
                    aa += a
            j = 4 * (y * size + x)
            if aa == 0:
                out[j] = out[j + 1] = out[j + 2] = out[j + 3] = 0
            else:
                out[j] = ar // aa
                out[j + 1] = ag // aa
                out[j + 2] = ab // aa
                out[j + 3] = aa // (ss * ss)

    write_png(path, size, size, out)


def write_png(path, w, h, rgba):
    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        c += struct.pack(">I", zlib.crc32(typ + data) & 0xFFFFFFFF)
        return c

    raw = bytearray()
    stride = w * 4
    for y in range(h):
        raw.append(0)  # filter type 0
        raw.extend(rgba[y * stride:(y + 1) * stride])

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)


if __name__ == "__main__":
    import os
    os.makedirs("icons", exist_ok=True)
    for size in (192, 512, 180):
        draw_icon(size, f"icons/icon-{size}.png")
        print("wrote", f"icons/icon-{size}.png")
