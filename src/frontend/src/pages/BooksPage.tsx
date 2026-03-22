import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Download,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Book } from "../backend";
import {
  useCreateBook,
  useDeleteBook,
  useGetAllBooks,
  useIsCallerAdmin,
} from "../hooks/useQueries";

const CATEGORIES = [
  "Mathematics",
  "Science",
  "History",
  "Literature",
  "Technology",
  "Arts",
  "Other",
];

type SampleBook = {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
};

const SAMPLE_BOOKS: SampleBook[] = [
  {
    id: "b1",
    title: "Fundamentals of Calculus",
    author: "Dr. Aryan Sharma",
    category: "Mathematics",
    description:
      "A comprehensive guide to differential and integral calculus for undergraduate students.",
  },
  {
    id: "b2",
    title: "The Story of Civilization",
    author: "Prof. Meena Rao",
    category: "History",
    description:
      "An exploration of human civilizations from ancient Mesopotamia to the modern era.",
  },
  {
    id: "b3",
    title: "Introduction to Machine Learning",
    author: "Vikram Nair",
    category: "Technology",
    description:
      "Hands-on machine learning techniques with practical examples in Python.",
  },
  {
    id: "b4",
    title: "Organic Chemistry Essentials",
    author: "Dr. Priya Singh",
    category: "Science",
    description:
      "Core concepts in organic chemistry with reaction mechanisms and lab techniques.",
  },
  {
    id: "b5",
    title: "Modern Indian Literature",
    author: "Ananya Krishnan",
    category: "Literature",
    description:
      "An anthology of short stories and poems from contemporary Indian authors.",
  },
  {
    id: "b6",
    title: "Classical Music Theory",
    author: "Rajan Iyer",
    category: "Arts",
    description:
      "Theory and practice of Indian classical music with notation systems.",
  },
];

type DisplayBook = Book | SampleBook;

function hasBlob(book: DisplayBook): book is Book {
  return "blob" in book && book.blob != null;
}

export default function BooksPage() {
  const { data: books, isLoading } = useGetAllBooks();
  const { data: isAdmin } = useIsCallerAdmin();
  const deleteBook = useDeleteBook();
  const createBook = useCreateBook();
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const displayBooks: DisplayBook[] =
    books && books.length > 0 ? books : SAMPLE_BOOKS;
  const filtered = displayBooks.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (!form.title || !form.author || !form.category) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
        setUploadProgress(p),
      );
      await createBook.mutateAsync({
        id: crypto.randomUUID(),
        title: form.title,
        author: form.author,
        category: form.category,
        description: form.description,
        blob,
      });
      toast.success("Book uploaded!");
      setUploadOpen(false);
      setForm({ title: "", author: "", category: "", description: "" });
      setUploadProgress(0);
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Book Library</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse and download academic resources
          </p>
        </div>
        {isAdmin && (
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button data-ocid="books.upload_button">
                <Plus className="mr-2 h-4 w-4" /> Upload Book
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="books.dialog">
              <DialogHeader>
                <DialogTitle>Upload New Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Book title"
                    data-ocid="books.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input
                    value={form.author}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, author: e.target.value }))
                    }
                    placeholder="Author name"
                    data-ocid="books.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, category: v }))
                    }
                  >
                    <SelectTrigger data-ocid="books.select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Short description"
                    data-ocid="books.textarea"
                  />
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <input ref={fileRef} type="file" className="w-full text-sm" />
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadProgress}% uploaded
                    </p>
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setUploadOpen(false)}
                    data-ocid="books.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBook.isPending}
                    data-ocid="books.submit_button"
                  >
                    {createBook.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search books by title, author, or category..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-ocid="books.search_input"
        />
      </div>

      {isLoading ? (
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="books.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" data-ocid="books.empty_state">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No books found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              data-ocid="books.item.1"
            >
              <Card className="shadow-card hover:shadow-card-hover transition-shadow h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-snug truncate">
                        {book.title}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {book.author}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {book.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-3">
                  {book.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {book.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-auto">
                    {hasBlob(book) && (
                      <a
                        href={book.blob.getDirectURL()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full"
                          data-ocid="books.button.1"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Download
                        </Button>
                      </a>
                    )}
                    {isAdmin && hasBlob(book) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          deleteBook.mutate(book.id);
                          toast.success("Book deleted");
                        }}
                        data-ocid="books.delete_button.1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
