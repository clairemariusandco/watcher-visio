# Détourage fond vert des images Watcher (Téléchargements -> assets/).
# Usage : powershell -ExecutionPolicy Bypass -File outils\detourer.ps1
# Recadrage commun aux images 1 et 2 : même corps, même échelle, le fondu 1->2 ne bouge pas.
$src = @"
using System; using System.Drawing; using System.Drawing.Imaging; using System.Drawing.Drawing2D; using System.Runtime.InteropServices;
public static class Detour {
  public static string Run(string inp, string outp, int outH, int minx, int miny, int cw, int ch) {
    var b = new Bitmap(inp); int W=b.Width, H=b.Height;
    var src = new Bitmap(W,H,PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(src)) g.DrawImage(b,0,0,W,H);
    var d = src.LockBits(new Rectangle(0,0,W,H), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    var px = new byte[W*H*4]; Marshal.Copy(d.Scan0, px, 0, px.Length);
    var a = new float[W*H];
    for (int i=0;i<W*H;i++){ int B=px[i*4],G=px[i*4+1],R=px[i*4+2];
      float gr = G - Math.Max(R,B);
      a[i] = 1f - Math.Min(1f, Math.Max(0f, (gr-18f)/85f));
      if (G>Math.Max(R,B)) px[i*4+1]=(byte)Math.Max(R,B); }   // despill : plus aucun vert
    for (int y=0;y<H;y++) for (int x=0;x<W;x++){ float m=a[y*W+x];
      for (int dy=-1;dy<=1;dy++) for (int dx=-1;dx<=1;dx++){ int xx=x+dx,yy=y+dy; if(xx<0||yy<0||xx>=W||yy>=H) continue; m=Math.Min(m,a[yy*W+xx]); }
      float v=(m+a[y*W+x])*0.5f; int i2=(y*W+x)*4; px[i2+3]=(byte)(v*255); if(v<=0.003f){px[i2]=0;px[i2+1]=0;px[i2+2]=0;} }
    Marshal.Copy(px,0,d.Scan0,px.Length); src.UnlockBits(d);
    int ow=(int)Math.Round(cw*(double)outH/ch);
    var o = new Bitmap(ow,outH,PixelFormat.Format32bppArgb);
    using (var g = Graphics.FromImage(o)) { g.InterpolationMode=InterpolationMode.HighQualityBicubic; g.CompositingMode=CompositingMode.SourceCopy; g.PixelOffsetMode=PixelOffsetMode.HighQuality;
      g.DrawImage(src, new Rectangle(0,0,ow,outH), minx,miny,cw,ch, GraphicsUnit.Pixel); }
    o.Save(outp, ImageFormat.Png); return outp+" "+ow+"x"+outH;
  }
}
"@
Add-Type -TypeDefinition $src -ReferencedAssemblies System.Drawing
$dl = "$env:USERPROFILE\Downloads"
$out = Join-Path $PSScriptRoot "..\assets"
[Detour]::Run("$dl\watcher_1_tete_baissee.png", "$out\watcher1.png", 720, 389, 16, 308, 1407)
[Detour]::Run("$dl\watcher_2_tete_relevee.png", "$out\watcher2.png", 720, 389, 16, 308, 1407)
# 3 = gros plan, réservé au jumpscare (MODE 6) : pas utilisé par la V0.
[Detour]::Run("$dl\watcher_3_gros_plan.png", "$out\watcher3.png", 900, 0, 0, 1086, 1448)
