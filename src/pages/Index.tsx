import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  lastModified: Date;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'library' | 'settings'>('editor');
  const [currentProject, setCurrentProject] = useState<Project>({
    id: '1',
    title: 'Новый проект',
    content: '',
    wordCount: 0,
    lastModified: new Date(),
  });
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Новый проект',
      content: '',
      wordCount: 0,
      lastModified: new Date(),
    },
  ]);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const countWords = (text: string) => {
    const trimmed = text.trim();
    return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  };

  const countChars = (text: string) => text.length;

  const estimateReadingTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleTextChange = (text: string) => {
    const updated = {
      ...currentProject,
      content: text,
      wordCount: countWords(text),
      lastModified: new Date(),
    };
    setCurrentProject(updated);
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
  };

  const handleCreateProject = () => {
    if (!newProjectTitle.trim()) {
      toast.error('Введите название проекта');
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      title: newProjectTitle,
      content: '',
      wordCount: 0,
      lastModified: new Date(),
    };

    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    setNewProjectTitle('');
    setIsNewProjectDialogOpen(false);
    setActiveTab('editor');
    toast.success('Проект создан');
  };

  const handleExport = (format: string) => {
    toast.success(`Экспорт в формате ${format} начат`);
  };

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setActiveTab('editor');
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentProject.content.substring(start, end);
    const beforeText = currentProject.content.substring(0, start);
    const afterText = currentProject.content.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    const newCursorPos = start + before.length + selectedText.length + after.length;

    handleTextChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const makeBold = () => {
    insertFormatting('**', '**');
  };

  const makeHeading = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = currentProject.content.substring(0, start);
    const afterText = currentProject.content.substring(start);
    
    const lastNewline = beforeText.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
    const lineText = beforeText.substring(lineStart);
    
    const existingHeading = lineText.match(/^#{1,6}\s/);
    if (existingHeading) {
      const newBeforeText = beforeText.substring(0, lineStart) + lineText.replace(/^#{1,6}\s/, '#'.repeat(level) + ' ');
      handleTextChange(newBeforeText + afterText);
    } else {
      const newBeforeText = beforeText.substring(0, lineStart) + '#'.repeat(level) + ' ' + lineText;
      handleTextChange(newBeforeText + afterText);
    }
    
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const wordCount = countWords(currentProject.content);
  const charCount = countChars(currentProject.content);
  const readingTime = estimateReadingTime(wordCount);

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="BookOpen" size={24} className="text-primary" />
            <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
              Writer's Tools
            </h1>
          </div>
          
          <nav className="flex gap-1">
            <Button
              variant={activeTab === 'editor' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('editor')}
              className="gap-2"
            >
              <Icon name="PenTool" size={18} />
              Редактор
            </Button>
            <Button
              variant={activeTab === 'library' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('library')}
              className="gap-2"
            >
              <Icon name="Library" size={18} />
              Библиотека
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('settings')}
              className="gap-2"
            >
              <Icon name="Settings" size={18} />
              Настройки
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'editor' && (
          <div className="h-full flex">
            <div className="flex-1 flex flex-col">
              <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
                <h2 className="text-lg font-medium text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {currentProject.title}
                </h2>
                <div className="flex gap-4 text-sm text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span>{wordCount} слов</span>
                  <span>{charCount} символов</span>
                  <span>{readingTime} мин чтения</span>
                </div>
              </div>
              
              <div className="border-b border-border bg-card px-6 py-2 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={makeBold}
                  className="gap-2"
                  title="Жирный (Ctrl+B)"
                >
                  <Icon name="Bold" size={16} />
                  <span className="text-sm">Жирный</span>
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => makeHeading(1)}
                  className="gap-1"
                  title="Заголовок 1"
                >
                  <Icon name="Heading1" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => makeHeading(2)}
                  className="gap-1"
                  title="Заголовок 2"
                >
                  <Icon name="Heading2" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => makeHeading(3)}
                  className="gap-1"
                  title="Заголовок 3"
                >
                  <Icon name="Heading3" size={16} />
                </Button>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <Textarea
                    ref={textareaRef}
                    value={currentProject.content}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Начните писать...\n\nИспользуйте панель форматирования:\n- **жирный текст**\n- # Заголовок 1\n- ## Заголовок 2\n- ### Заголовок 3"
                    className="min-h-[calc(100vh-350px)] border-0 p-8 text-lg leading-relaxed resize-none focus-visible:ring-0 bg-card"
                    style={{ fontFamily: 'Merriweather, serif' }}
                  />
                </div>
              </div>
            </div>

            <aside className="w-64 border-l border-border bg-card p-6 overflow-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Статистика
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Слова:</span>
                      <span className="font-medium text-foreground">{wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Символы:</span>
                      <span className="font-medium text-foreground">{charCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Время чтения:</span>
                      <span className="font-medium text-foreground">{readingTime} мин</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Экспорт
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => handleExport('PDF')}
                    >
                      <Icon name="FileText" size={16} />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => handleExport('DOCX')}
                    >
                      <Icon name="FileText" size={16} />
                      Word (DOCX)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => handleExport('EPUB')}
                    >
                      <Icon name="BookOpen" size={16} />
                      EPUB
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => handleExport('TXT')}
                    >
                      <Icon name="FileText" size={16} />
                      Plain Text
                    </Button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Мои проекты
                </h2>
                <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Icon name="Plus" size={18} />
                      Новый проект
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Создать проект</DialogTitle>
                      <DialogDescription>
                        Введите название для нового проекта
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Название</Label>
                        <Input
                          id="title"
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          placeholder="Мой новый роман"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCreateProject();
                            }
                          }}
                        />
                      </div>
                      <Button onClick={handleCreateProject} className="w-full">
                        Создать
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleProjectSelect(project)}
                  >
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {project.title}
                      </h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{project.wordCount} слов</Badge>
                        <Badge variant="secondary">
                          {estimateReadingTime(project.wordCount)} мин
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {project.content.slice(0, 100)}
                        {project.content.length > 100 ? '...' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Изменено: {project.lastModified.toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-foreground mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                Настройки
              </h2>
              
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Интерфейс
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Шрифт редактора</p>
                        <p className="text-sm text-muted-foreground">Merriweather</p>
                      </div>
                      <Badge>По умолчанию</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Размер шрифта</p>
                        <p className="text-sm text-muted-foreground">18px</p>
                      </div>
                      <Badge>По умолчанию</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Экспорт
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Формат по умолчанию</p>
                        <p className="text-sm text-muted-foreground">PDF</p>
                      </div>
                      <Badge>Активен</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Включать статистику</p>
                        <p className="text-sm text-muted-foreground">Добавлять счётчик слов в документ</p>
                      </div>
                      <Badge variant="secondary">Выключен</Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    О программе
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Writer's Tools</strong> — минималистичный инструмент для писателей</p>
                    <p>Версия 1.0.0</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;