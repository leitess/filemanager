---
sidebar_position: 5
---

# Upload de um arquivo
Essa funcionalidade é a mais importante da aplicação, essa funcionalidade é a que dá valor ao cliente; é o diferencial desde projeto
e o seu próposito.

Após ter definido a historia de usuários e os cenários de testes que farão dessa funcionalidade, uma funcionalidade bem sucedida.
Pensar nos comportamentos do projeto, ajudou não só a garantir a qualidade, mas aprender a implementar essa funcionalidade. Mesmo
que testar, para só então implementar, seja uma linha de racicionio fora da curva.

## Testes
o conceito de *resumable upload*, consiste em garantir que o upload do arquivo não vai ser pedido, caso haja a queda de internet do
lado do cliente ou do lado do servidor. O que se sabe sobre esse conceito é que assim que o upload inicia é iniciado uma sessão:

```ts title="test/core/domain/file/services/UploadFile.service.spec.ts"
it('when starts an upload session then metadata must be return', async () => {
        const sessionId = 'session-upload-mock-10128376';
        const metadata = {
            filename: '1837373-video.mp4',
            mimetype: 'video/mp4',
            filesize: 1000000,
            totalChunks: 3,
        } as MetadataTypesMock;

        const session = await service.startUpload(sessionId, metadata);

        expect(dbMock.insertSession).toHaveBeenCalledWith(sessionId, expect.any(Object));
        expect(session.metadata).toEqual(metadata);
    });
```

```ts title="test/core/domain/file/services/UploadFile.service.mock.ts"
public async startUpload(sessionId: string, metadata: MetadataTypesMock) {
        const session = {
            sessionId,
            metadata,
            chunks: [],
            completed: false,
            createdAt: new Date(),
        } as UploadSessionTypesMock;

        await this._db.insertSession(sessionId, session);
        return session;
    }
```

Após verificar se sessão foi salva no banco de dados, é retornado para o lado do cliente, os metadados do arquivo que está sendo
feito o upload.

Com os metadados salvos com sucesso, se inicia o upload de cada parte do arquivo. O arquivo no lado do cliente será "quebrado" em
diversas partes e cada "pedacinho" do arquivo deve ser armazenado. Além de que é necessario, verificar se cada parte está sendo 
salva com sucesso; o que garante isso, é um array booleano, todo "pedacinho" salvo com sucesso, será salvo como `true` no array de
booleanos, pelo contrário será `false`.

Em outras palavras, o proximo teste verifica isso. Quando a primeira parte é salva, mas a segunda não; e o lado do cliente envia
a terceira parte, o lado do servidor retorna para a segunda parte. Pois, quando o arquivo for montado, não esteja corrompido.

```ts title="test/core/domain/file/services/UploadFile.service.spec.ts"
    it('when internet connection is down then try it again', async () => {
        const sessionId = 'session-upload-mock-9384673';
        
        const session = {
           sessionId,
           metadata: {
                filename: '1837373-text-test.txt',
                mimetype: 'text/plain',
                filesize: 1000000,
                totalChunks: 3,
           },
           chunks: [],
           completed: false,
        } as UploadSessionTypesMock;

        dbMock.findSession.mockResolvedValue(session);

        await service.uploadChunk(sessionId, 0, Buffer.from('part 1'));
        
        expect(storageMock.saveChunk).toHaveBeenCalledWith(sessionId, 0, expect.any(Buffer));
        expect(dbMock.updateSession).toHaveBeenCalled();


        await service.uploadChunk(sessionId, 1, Buffer.from('part 2'));
        expect(storageMock.saveChunk).toHaveBeenCalledWith(sessionId, 1, expect.any(Buffer));
    });
```

```ts title="test/core/domain/file/services/UploadFile.service.mock.ts"
    public async uploadChunk(sessionId: string, chunkIndex: number, chunk: Buffer) {
        const session = await this._db.findSession(sessionId);

        if (!session) throw new Error('Upload session not found');

        await this._storage.saveChunk(sessionId, chunkIndex, chunk);
        session.chunks[chunkIndex] = true;
        await this._db.updateSession(sessionId, session);
    }
```

Por isso, vamos a ultima parte do processo do *resumable upload*, quando todos os "pedacinhos" do arquivo for enviada com sucesso;
o array booleano vai ficar preenchido de `true`. Então, é hora de juntar todas as partes.

Este teste junta todas as partes e finaliza o teste com sucesso:

```ts title="test/core/domain/file/services/UploadFile.service.spec.ts"

    it('when assemble all chunks then complete upload', async () => {
        const sessionId = 'session-upload-mock-263532';

        const session = {
            sessionId,
           metadata: {
                originalFilename: 'succeed-test.txt',
                filename: '1837373-succeed-test.txt',
                mimetype: 'text/plain',
                filesize: 33000,
           },
           chunks: [true, true],
           completed: false,
        };

        dbMock.findSession.mockResolvedValue(session);
        storageMock.assembleChunks.mockResolvedValue(Buffer.from('part1part2'));

        const result = await service.completeUpload(sessionId);

        expect(storageMock.save).toHaveBeenCalledWith(result.id, expect.any(Buffer));
        expect(dbMock.insert).toHaveBeenCalledWith(expect.objectContaining({
            filename: '1837373-succeed-test.txt',
        }));
        expect(dbMock.deleteSession).toHaveBeenCalledWith(sessionId);
    });
```

```ts title="test/core/domain/file/services/UploadFile.service.mock.ts"
 public async completeUpload(sessionId: string): Promise<FileMetadataTypesMock> {
        const session = await this._db.findSession(sessionId);
        if (!session) throw new Error('Upload session not found');

        const { totalChunks } = session.metadata;
        const receivedChunks = session.chunks ?? [];

        const missing: number[] = [];
        for (let i = 0; i < totalChunks; i++) {
            if (!receivedChunks[i]) missing.push(i);
        }

        if (missing.length > 0) {
        throw new Error(`Upload incompleto: chunks faltando [${missing.join(', ')}]`);
        }

        const allChunks = await this._storage.assembleChunks(sessionId);
        const id = crypto.randomUUID();
        const createdAt = new Date();
        const updatedAt = new Date();
        const downloadUrl = `/download/${id}`;

        await this._storage.save(id, allChunks);
        const fileData: FileMetadataTypesMock = {
            ...session.metadata,
            id,
            createdAt,
            updatedAt,
            downloadUrl,
        };

        await this._db.insert(fileData);
        await this._db.deleteSession(sessionId);

        return fileData;
    }
```

Não será discutido nessa página os ultimos dois testes que visam em verificar o comportamento do upload para arquivos grandes, pois
por estar sendo usado mocks; os mocks não lidam muito bem com arquivos grandes, podem falhar mesmo se o teste estar escrito corretamente.

Para realizar testes com arquivos grandes, o ideal é realizar um teste de carga, isso pode ser feito pelo frontend, `curl`,
Postman, Insominia ou `supertest`. 

Os testes não só ajudaram na implementação, mas também ajudaram a pensar em algumas refatorações, como por exemplo: escrever uma 
`interface` para o tipo de `Metadado` e `Sessão` do upload.

```ts title="test/core/domain/file/types/FileMetadata.types.mock.ts"
export interface FileMetadataTypesMock {
  id: string;
  filename: string;
  mimetype: string;
  filesize: number;
  createdAt: Date;
  updatedAt: Date;
}
```

```ts title="test/core/domain/upload_session/types/UploadSessionMetadata.types.mock.ts"
export interface MetadataTypesMock {
  filename: string;
  mimetype: string,
  totalChunks: number;
}

export interface UploadSessionTypesMock {
  sessionId: string;
  metadata: MetadataTypesMock;
  chunks: boolean[];
  completed: boolean;
}
```

## Implementação
A cada teste foi implementado a função real que foi testada, e foi pensado em usar GridFSBucket para poder armazenar arquivos grandes,
esses arquivos embora estejam tendo suas partes salvas em uma pasta temporaria no backend. O arquivo final fica no MongoDB. GridFS é
ideal para arquivos grandes. 

Como foi planejado nos testes, primeiro é salvo a sessão no banco de dados. Abaixo está a implementação da funcionalidade tanto no 
repositorio, quando na classe de serviço:

```ts title="src/core/domain/upload_session/repository/UploadSession.repository.ts"
async insertSession(sessionId: string, session: any) {
    await UploadSessionModel.create({ ...session, sessionId });
  }
```

```ts title="src/core/domain/file/services/File.service.ts"
public async startUpload(sessionId: string, metadata: MetadataTypes) {
    const session = {
      sessionId,
      metadata,
      chunks: [],
      completed: false,
    } as UploadSessionTypes;
    await this.uploadSessionRepository.insertSession(sessionId, session);
    return session;
  }
```

Depois de planejado o salvamento da sessão, cada parte do arquivo, então é armazenada na backend e a sessão é atualizada, conforme
foi implementada, na classe de serviço, armazenamento e repositorio:

```ts title="src/core/domain/upload_session/repository/UploadSession.repository.ts"
  async findSession(sessionId: string) {
    return UploadSessionModel.findOne({ sessionId }).lean();
  }

```

```ts title="src/infrastructure/gridfs/GridFsStorage.impl.ts"
  async saveChunk(sessionId: string, index: number, chunk: Buffer) {
    const dir = join(tmpdir(), sessionId);
    await fs.mkdir(dir, { recursive: true });
    const chunkPath = join(dir, `${index}`);
    await fs.writeFile(chunkPath, chunk);
  }
```

```ts title="src/core/domain/file/services/File.service.ts"
  public async uploadChunk(sessionId: string, chunkIndex: number, chunk: Buffer) {
    const storage =  getGridFSStorage();
    const session = await this.uploadSessionRepository.findSession(sessionId);
    if (!session) throw new Error("Upload session not found");

    await storage.saveChunk(sessionId, chunkIndex, chunk);
    session.chunks[chunkIndex] = true;
    await this.uploadSessionRepository.updateSession(sessionId, session);
  }
```

Por fim, o upload deve ser concluido, conforme o terceiro teste realizado. A implementação deve concatenar todos os binarios em um
unico `Buffer` e esse buffer, deve ser amazenado no GridFS, então o repositorio da coleção de arquivos salva o novo arquivo e deleta a sessão que
estava salva no banco de dados.

```ts title="src/core/domain/upload_session/repository/UploadSession.repository.ts""
async findSession(sessionId: string) {
    return UploadSessionModel.findOne({ sessionId }).lean();
  }

async deleteSession(sessionId: string) {
    await UploadSessionModel.deleteOne({ sessionId });
  }
```

```ts title="src/core/domain/file/repository/File.repository.ts"
  async insert(fileData: FileMetadataTypes) {
    await FileModel.create(fileData);
  }
```


```ts title="src/infrastructure/gridfs/GridFsStorage.impl.ts"
  async assembleChunks(sessionId: string): Promise<Buffer> {
    const dir = join(tmpdir(), sessionId);
    const files = await fs.readdir(dir);
    const buffers: Buffer[] = [];

    const sortedFiles = files.map(Number).sort((a, b) => a - b);
    for (const i of sortedFiles) {
      const chunk = await fs.readFile(join(dir, `${i}`));
      buffers.push(chunk);
    }

    await fs.rm(dir, { recursive: true, force: true });
    return Buffer.concat(buffers);
  }

  async save(fileId: string, data: Buffer) {
    const stream = this.bucket.openUploadStream(fileId);
    const readable = Readable.from(data);
    readable.pipe(stream);
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
  }
```

```ts title="src/core/domain/file/services/File.service.ts"
  public async completeUpload(sessionId: string): Promise<FileMetadataTypes> {
    const storage =  getGridFSStorage();
    const session = await this.uploadSessionRepository.findSession(sessionId);
    if (!session) throw new Error("Upload session not found");

    const allChunks = await storage.assembleChunks(sessionId);
    const id = randomUUID();
    const createdAt = new Date();
    const updatedAt = new Date();

    await storage.save(id, allChunks);

    const fileData: FileMetadataTypes = {
      id,
      filename: session.metadata.filename,
      mimetype: session.metadata.mimetype,
      filesize: allChunks.length,
      createdAt,
      updatedAt,
    };

    await this.fileRepository.insert(fileData);
    await this.uploadSessionRepository.deleteSession(sessionId);

    return fileData;
  }
```