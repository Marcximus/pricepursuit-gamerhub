
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ComparisonTableProps {
  product1: {
    name: string;
    specs: Record<string, string | number>;
  };
  product2: {
    name: string;
    specs: Record<string, string | number>;
  };
  specOrder?: string[];
}

export const ComparisonTable = ({ product1, product2, specOrder }: ComparisonTableProps) => {
  // Get all unique spec keys
  const allKeys = new Set([
    ...Object.keys(product1.specs),
    ...Object.keys(product2.specs)
  ]);
  
  // If specOrder is provided, use it to sort the keys
  const orderedKeys = specOrder || Array.from(allKeys);
  
  return (
    <div className="my-6 overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Specification</TableHead>
            <TableHead className="w-1/3">{product1.name}</TableHead>
            <TableHead className="w-1/3">{product2.name}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orderedKeys.map((key) => (
            <TableRow key={key}>
              <TableCell className="font-medium">{key}</TableCell>
              <TableCell>{product1.specs[key] || '-'}</TableCell>
              <TableCell>{product2.specs[key] || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ComparisonTable;
