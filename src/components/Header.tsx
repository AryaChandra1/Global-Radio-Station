import { Globe2, Radio, Headphones } from 'lucide-react';

export function Header() {
  return (
    <header className="glass-panel rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Globe2 className="w-8 h-8 text-primary" />
            <Radio className="w-4 h-4 text-accent absolute -bottom-1 -right-1" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Global Radio Explorer
            </h1>
            <p className="text-xs text-muted-foreground">
              Discover radio stations worldwide
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Headphones className="w-4 h-4" />
          <span>Powered by RadioBrowser</span>
        </div>
      </div>
    </header>
  );
}
