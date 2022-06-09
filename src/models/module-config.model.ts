import { Schema, Model, model } from 'mongoose'

export interface IModuleConfig extends Document {
  moduleName: string;
  guildId: string;
  enabled: boolean;
  params: any[];  
}

export interface IModuleConfigModel extends Model<IModuleConfig> {
  getAll(): Promise<Array<IModuleConfig>>;
  updateParams(moduleName: string, params: any[]): Promise<void>;
}

export const ModuleConfigSchema = new Schema<IModuleConfig>({
  moduleName: { type: String, required: true },
  guildId: { type: String, required: false },
  enabled: { type: Boolean, required: true },
  params: { type: Schema.Types.Mixed, required: false }
}, { collection: 'modules' });

ModuleConfigSchema.static('getAll', async (): Promise<Array<IModuleConfig>> => {
  return await ModuleConfig.find({}).then((result) => {
    if (!result || result.length <= 0) {
      throw new Error('Error: no config found!');
    }

    return result;
  }).catch((error) => { throw error; })
});

ModuleConfigSchema.static('updateParams', async (moduleName: string, params: any[]): Promise<void> => {
  return await ModuleConfig.updateOne({ moduleName: moduleName }, { params: params })
    .then(() => Promise.resolve())
    .catch((error) => Promise.reject(error));
});

export const ModuleConfig: IModuleConfigModel = model<IModuleConfig, IModuleConfigModel>('modules', ModuleConfigSchema);