import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ICategoriaProdutoService } from '../../../../domain/categoria/service/categoria-produto.service.interface';
import { CategoriaProduto } from '../../../../domain/categoria/model/categoria-produto.model';
import { BaseController } from '../../base.controller';
import { ListarCategoriaResponse } from './response/listar-categoria.response';

@Controller('v1/categoria')
@ApiTags('Categoria Produto')
export class CategoriaProdutoController extends BaseController{
   private logger: Logger = new Logger(CategoriaProdutoController.name);

   constructor(@Inject('IService<CategoriaProduto>') private service: ICategoriaProdutoService) {super()}

   @Get()
   @ApiOperation({
      summary: 'Lista categorias',
      description: 'Lista categorias de produto',
   })
   @ApiOkResponse({ description: 'Categorias de produto encontradas com sucesso', type: ListarCategoriaResponse, isArray: true })
   async findAll(): Promise<CategoriaProduto[]> {
      this.logger.debug(`Listando todas as categorias de produto`);
      return await this.service.findAll()
         .then((categorias) => {
            return categorias.map((categoria) => new ListarCategoriaResponse(categoria));
         });
   }
}
