import NextImage, { ImageProps } from "next/image";

type PropsT = Omit<ImageProps, "placeholder">;

const shimmer = (w?: number | `${number}`, h?: number | `${number}`) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) => (globalThis.window === undefined ? Buffer.from(str).toString("base64") : globalThis.window.btoa(str));

export default function Image({ height, width, fill = false, ...props }: Readonly<PropsT>) {
    return <NextImage {...props} fill={fill} {...(!fill && { height, width })} placeholder={props.preload ? "empty" : `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`} />;
}
