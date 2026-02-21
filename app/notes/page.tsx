import { PageHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NotesEditor } from '@/components/NotesEditor';

export default function NotesPage() {
    return (
        <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto">
            <PageHeader
                title="My Notes"
                subtitle="Thoughts & Ideas"
                icon="📝"
            />

            <main className="mb-8">
                <NotesEditor />
            </main>

            <Footer />
        </div>
    );
}
