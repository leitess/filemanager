import fileService from '../../../core/domain/file/services';
import FileController from './File.controller';

const fileController = new FileController(fileService);
export default fileController;
