# 📷 Documentação: Upload de Imagens em Produtos

## 📚 Visão Geral

Sistema de upload de imagens para produtos, armazenando as imagens em **Base64** diretamente no banco de dados.

---

## 🏗️ Arquitetura

```
FRONTEND (React)
    ↓
[ImageUpload Component]
    ↓
[Converte para Base64]
    ↓
[Envia para API]
    ↓
BACKEND (C#)
    ↓
[Salva em Produto.Foto]
    ↓
[Armazena no SQL Server]
```

---

## 🔧 Componentes Criados

### 1️⃣ **ImageUpload.tsx** - Componente de Upload

**Localização:** `frontend/src/components/ImageUpload.tsx`

**Funcionalidades:**
- ✅ Seleciona imagem via input ou arraste
- ✅ Valida tipo (apenas imagens)
- ✅ Valida tamanho (máximo 5MB)
- ✅ Converte para Base64
- ✅ Mostra preview da imagem
- ✅ Callback ao selecionar

**Props:**
```typescript
interface ImageUploadProps {
  onImageSelect: (base64: string) => void;  // Callback com Base64
  currentImage?: string;                     // Imagem atual
  label?: string;                            // Label customizável
}
```

**Como usar:**
```tsx
const [image, setImage] = useState<string>("");

<ImageUpload
  onImageSelect={setImage}
  currentImage={formData.foto}
  label="Selecione a foto do produto"
/>
```

---

## 🔄 Fluxo de Upload (Passo a Passo)

### **Passo 1: Usuário Seleciona Imagem**

```tsx
<input
  type="file"
  accept="image/*"
  onChange={handleFileChange}
/>
```

### **Passo 2: Validação**

```tsx
// Valida tipo
if (!file.type.startsWith("image/")) {
  alert("Por favor, selecione uma imagem válida");
  return;
}

// Valida tamanho (máximo 5MB)
if (file.size > 5 * 1024 * 1024) {
  alert("Imagem muito grande (máximo 5MB)");
  return;
}
```

### **Passo 3: Converte para Base64**

```tsx
const reader = new FileReader();
reader.onload = (e) => {
  const base64 = e.target?.result as string;
  // base64 = "data:image/png;base64,iVBORw0KGgoAAAANS..."
  onImageSelect(base64);  // Envia callback
};
reader.readAsDataURL(file);  // Converte para Base64
```

**O que é Base64?**
```
Imagem binária (bytes)
    ↓
Codificação Base64 (texto)
    ↓
"data:image/png;base64,iVBORw0KGgoAAAANS..."
    ↓
Armazena em string no banco
```

### **Passo 4: Armazena no State**

```tsx
const [formData, setFormData] = useState({
  nome: "",
  preco: "",
  estoque: "",
  foto: ""  // ← Base64 da imagem
});

// Quando usuário seleciona:
setFormData({
  ...formData,
  foto: base64String
});
```

### **Passo 5: Envia para API**

```tsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  await apiFetch("/produtos", {
    method: "POST",
    body: JSON.stringify({
      nome: formData.nome,
      preco: formData.preco,
      estoque: formData.estoque,
      foto: formData.foto  // ← Envia Base64
    })
  });
};
```

### **Passo 6: Backend Salva**

```csharp
[HttpPost]
public async Task<IActionResult> Adicionar([FromBody] Produto produto)
{
    // produto.Foto = "data:image/png;base64,iVBORw0KG..."
    
    var id = await _produtoService.AdicionarAsync(produto);
    return CreatedAtAction(nameof(ObterPorId), new { id }, produto);
}
```

### **Passo 7: Exibir na Tabela**

```tsx
<td className="px-6 py-4">
  {product.foto ? (
    <img
      src={product.foto}
      alt={product.nome}
      className="h-12 w-12 object-cover rounded"
    />
  ) : (
    <span className="text-gray-400">Sem foto</span>
  )}
</td>
```

---

## 📊 Estrutura de Dados

### **Model Produto (Backend)**

```csharp
public class Produto
{
    public int CodProduto { get; set; }
    public string Nome { get; set; }
    public decimal Preco { get; set; }
    public int Estoque { get; set; }
    public string? Foto { get; set; }  // ← NOVO!
}
```

### **Type Produto (Frontend)**

```typescript
export interface Produto {
  codProduto: number;
  nome: string;
  preco: number;
  estoque: number;
  foto?: string;  // ← NOVO!
}
```

---

## 🎯 Exemplo Completo

### **No Formulário de Novo Produto:**

```tsx
<div className="space-y-4">
  {/* Imagem */}
  <ImageUpload
    onImageSelect={(base64) =>
      setFormData({ ...formData, foto: base64 })
    }
    currentImage={formData.foto}
    label="Foto do produto"
  />

  {/* Nome */}
  <Input
    label="Nome"
    value={formData.nome}
    onChange={(e) =>
      setFormData({ ...formData, nome: e.target.value })
    }
  />

  {/* Preço */}
  <Input
    label="Preço"
    type="number"
    value={formData.preco}
    onChange={(e) =>
      setFormData({ ...formData, preco: e.target.value })
    }
  />

  {/* Botão */}
  <button onClick={handleSubmit}>
    Salvar Produto
  </button>
</div>
```

---

## ⚙️ Configuração

### **Limites:**
- 📏 **Tamanho máximo:** 5MB
- 🖼️ **Tipos permitidos:** PNG, JPG, GIF, WEBP, etc
- 💾 **Armazenamento:** Base64 no banco de dados

### **Base64 vs URL:**

| Aspecto | Base64 | URL |
|---------|--------|-----|
| Armazenamento | No banco | No servidor |
| Tamanho | ~33% maior | Menor |
| Upload | Inline | Precisa de upload |
| Simplicidade | ⭐⭐⭐ | ⭐⭐ |

**Escolhemos Base64 porque:**
- ✅ Simples de implementar
- ✅ Sem servidor de arquivos
- ✅ Atomicidade (foto + produto juntos)

---

## 🚀 Como Usar

### **1. Importar componente**
```tsx
import ImageUpload from "@/components/ImageUpload";
```

### **2. Adicionar ao formulário**
```tsx
<ImageUpload
  onImageSelect={(base64) =>
    setFormData({ ...formData, foto: base64 })
  }
/>
```

### **3. Enviar para API**
```tsx
const response = await apiFetch("/produtos", {
  method: "POST",
  body: JSON.stringify({
    ...formData,
    foto: formData.foto  // Base64
  })
});
```

### **4. Exibir na tabela**
```tsx
<img
  src={product.foto}
  alt={product.nome}
  className="h-12 w-12 rounded"
/>
```

---

## 🔍 Troubleshooting

### **Imagem não aparece na tabela:**
- Verifica se `product.foto` não é `null` ou `undefined`
- Verifica se é uma string válida começando com `data:image`

### **Erro "Imagem muito grande":**
- Comprima a imagem antes de fazer upload
- Use ferramentas online (tinypng.com)

### **Base64 está muito grande no banco:**
- Normal! Uma imagem PNG de 100KB vira ~130KB em Base64
- Se tiver muitos produtos com fotos, considere migrar para servidor de arquivos

---

## 📝 Commits Relacionados

```
✅ feat: Criar componente ImageUpload
✅ feat: Adicionar campo foto ao modelo Produto
✅ feat: Adicionar foto no formulário de produtos
✅ feat: Exibir foto na tabela de produtos
```

---

## 🎓 Conceitos Aprendidos

1. **FileReader API** - Ler arquivo local
2. **Base64 encoding** - Converter binário para texto
3. **Data URLs** - Formato `data:image/png;base64,...`
4. **Validação de arquivo** - Tipo e tamanho
5. **Preview de imagem** - Mostrar antes de enviar

---

## ✨ Próximas Melhorias

- [ ] Compressão automática de imagem
- [ ] Crop/redimensionamento
- [ ] Migrar para servidor de arquivos (S3, etc)
- [ ] Cache de imagens
- [ ] Lazy loading de imagens

---

**Documentação criada:** 2026-07-20
**Componente:** ImageUpload.tsx
**Status:** ✅ Implementado
