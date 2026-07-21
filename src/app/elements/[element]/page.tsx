import { getAllElements } from '@/lib/data';
import ElementClient from './ElementClient';

export function generateStaticParams() {
  return getAllElements().map((el) => ({ element: el.id }));
}

export default function ElementPage() {
  return <ElementClient />;
}
