
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';

export default function ResponsiveLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 bg-card shadow-sm border-b z-50">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Logo
            </div>
            
            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Sobre</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Serviços</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Contato</a>
            </nav>

            {/* Botão Menu Mobile */}
            <button className="md:hidden" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-background border-t">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a href="#" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Sobre</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Serviços</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">Contato</a>
            </nav>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Grid de Botões */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Ações</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="default" className="w-full">Botão 1</Button>
            <Button variant="secondary" className="w-full">Botão 2</Button>
            <Button variant="outline" className="w-full">Botão 3</Button>
            <Button variant="ghost" className="w-full">Botão 4</Button>
          </div>
        </section>

        {/* Tabela Responsiva */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Dados</h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({length: 5}).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>Usuário {i + 1}</TableCell>
                    <TableCell>usuario{i + 1}@email.com</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
}
