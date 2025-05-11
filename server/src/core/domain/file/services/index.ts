import uploadSessionsRepository from '../../upload_session/repository';
import fileRepository from '../repository';
import FileService from './File.service';

const fileService = new FileService(uploadSessionsRepository, fileRepository);

export default fileService;
