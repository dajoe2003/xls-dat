import { Header } from '@/components/Header';
import { OutputStep } from '@/components/OutputStep';

export default function OutputPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <OutputStep />
      </main>
    </div>
  );
}
