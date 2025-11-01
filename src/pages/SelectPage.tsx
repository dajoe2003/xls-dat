import { Header } from '@/components/Header';
import { SelectStep } from '@/components/SelectStep';

export default function SelectPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <SelectStep />
      </main>
    </div>
  );
}
