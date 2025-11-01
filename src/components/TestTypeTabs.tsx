import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConverter, TestType } from '@/contexts/ConverterContext';

const testTypes: TestType[] = ['MMPI-2', 'MCMI-4', 'MMPI-A', 'MMPI-RF'];

export function TestTypeTabs() {
  const { testType, setTestType } = useConverter();

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <Tabs value={testType} onValueChange={(value) => setTestType(value as TestType)}>
        <TabsList className="grid w-full grid-cols-4 h-auto">
          {testTypes.map((type) => (
            <TabsTrigger
              key={type}
              value={type}
              className="text-sm font-medium py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
