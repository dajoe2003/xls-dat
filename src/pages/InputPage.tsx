import { Header } from '@/components/Header';
import { TestTypeTabs } from '@/components/TestTypeTabs';
import { InputStep } from '@/components/InputStep';

export default function InputPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <TestTypeTabs />
        <InputStep />
      </main>
    </div>
  );
}
