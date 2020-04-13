import { isDesktopApplication, dictToArray } from '@/utils';
import {
  SNPredicate,
  ContentType,
  CreateMaxPayloadFromAnyObject,
  ApplicationService
} from 'snjs';

const STREAM_ITEMS_PERMISSION = 'stream-items';

/** A class for handling installation of system extensions */
export class NativeExtManager extends ApplicationService {
  /* @ngInject */
  constructor(application) {
    super(application);
    this.extManagerId = 'org.standardnotes.extensions-manager';
    this.batchManagerId = 'org.standardnotes.batch-manager';
  }
  
  /** @override */
  onAppLaunch() {
    super.onAppLaunch();
    this.reload();
  }

  get extManagerPred() {
    const extManagerId = 'org.standardnotes.extensions-manager';
    return SNPredicate.CompoundPredicate([
      new SNPredicate('content_type', '=', ContentType.Component),
      new SNPredicate('package_info.identifier', '=', extManagerId)
    ]);
  }

  get batchManagerPred() {
    const batchMgrId = 'org.standardnotes.batch-manager';
    return SNPredicate.CompoundPredicate([
      new SNPredicate('content_type', '=', ContentType.Component),
      new SNPredicate('package_info.identifier', '=', batchMgrId)
    ]);
  }

  reload() {
    this.application.singletonManager.registerPredicate(this.extManagerPred);
    this.application.singletonManager.registerPredicate(this.batchManagerPred);
    this.resolveExtensionsManager();
    this.resolveBatchManager();
  }

  async resolveExtensionsManager() {
    const extensionsManager = await this.application.singletonManager.findOrCreateSingleton({
      predicate: this.extManagerPred,
      createPayload: this.extensionsManagerTemplatePayload()
    });
    let needsSync = false;
    if (isDesktopApplication()) {
      if (!extensionsManager.local_url) {
        extensionsManager.local_url = window._extensions_manager_location;
        needsSync = true;
      }
    } else {
      if (!extensionsManager.hosted_url) {
        extensionsManager.hosted_url = window._extensions_manager_location;
        needsSync = true;
      }
    }
    // Handle addition of SN|ExtensionRepo permission
    const permission = extensionsManager.content.permissions.find((p) => p.name === STREAM_ITEMS_PERMISSION);
    if (!permission.content_types.includes(ContentType.ExtensionRepo)) {
      permission.content_types.push(ContentType.ExtensionRepo);
      needsSync = true;
    }
    if (needsSync) {
      this.application.saveItem({ item: extensionsManager });
    }
  }

  extensionsManagerTemplatePayload() {
    const url = window._extensions_manager_location;
    if (!url) {
      console.error('window._extensions_manager_location must be set.');
      return;
    }
    const packageInfo = {
      name: 'Extensions',
      identifier: this.extManagerId
    };
    const content = {
      name: packageInfo.name,
      area: 'rooms',
      package_info: packageInfo,
      permissions: [
        {
          name: STREAM_ITEMS_PERMISSION,
          content_types: [
            ContentType.Component,
            ContentType.Theme,
            ContentType.ServerExtension,
            ContentType.ActionsExtension,
            ContentType.Mfa,
            ContentType.Editor,
            ContentType.ExtensionRepo
          ]
        }
      ]
    };
    if (isDesktopApplication()) {
      content.local_url = window._extensions_manager_location;
    } else {
      content.hosted_url = window._extensions_manager_location;
    }
    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        content_type: ContentType.Component,
        content: content
      }
    });
    return payload;
  }

  batchManagerTemplatePayload() {
    const url = window._batch_manager_location;
    if (!url) {
      console.error('window._batch_manager_location must be set.');
      return;
    }
    const packageInfo = {
      name: 'Batch Manager',
      identifier: this.batchManagerId
    };
    const allContentType = dictToArray(ContentType);
    const content = {
      name: packageInfo.name,
      area: 'modal',
      package_info: packageInfo,
      permissions: [
        {
          name: STREAM_ITEMS_PERMISSION,
          content_types: allContentType
        }
      ]
    };
    if (isDesktopApplication()) {
      content.local_url = window._batch_manager_location;
    } else {
      content.hosted_url = window._batch_manager_location;
    }
    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        content_type: ContentType.Component,
        content: content
      }
    });
    return payload;
  }

  async resolveBatchManager() {
    const batchManager = await this.application.singletonManager.findOrCreateSingleton({
      predicate: this.batchManagerPred,
      createPayload: this.batchManagerTemplatePayload()
    });
    let needsSync = false;
    if (isDesktopApplication()) {
      if (!batchManager.local_url) {
        batchManager.local_url = window._batch_manager_location;
        needsSync = true;
      }
    } else {
      if (!batchManager.hosted_url) {
        batchManager.hosted_url = window._batch_manager_location;
        needsSync = true;
      }
    }
    // Handle addition of SN|ExtensionRepo permission
    const permission = batchManager.content.permissions.find((p) => p.name === STREAM_ITEMS_PERMISSION);
    if (!permission.content_types.includes(ContentType.ExtensionRepo)) {
      permission.content_types.push(ContentType.ExtensionRepo);
      needsSync = true;
    }
    if (needsSync) {
      this.application.saveItem({ item: batchManager });
    }
  }
}
