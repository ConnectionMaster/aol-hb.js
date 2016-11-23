import RenderingManager from 'src/renderingManager';

describe('RenderAdManager', () => {
  let getSubject = (bidResponse) => {
    let document = {
      createElement: () => {},
      getElementById: () => {}
    };
    let renderingManager = new RenderingManager(bidResponse || {});
    renderingManager.document = document;

    return renderingManager;
  };

  describe('createAdFrame()', () => {
    it('should return iframe element with settings', () => {
      let subject = getSubject({
        adContainerId: 'ad-container-id',
        width: 'value-width',
        height: 'value-height'
      });
      let iframeElement = {
        style: {},
        setAttribute: () => {}
      };
      let setAttributeStub = sinon.stub(iframeElement, 'setAttribute');
      let createElementStub = sinon.stub(subject.document, 'createElement').returns(iframeElement);

      subject.createAdFrame();
      expect(createElementStub.withArgs('iframe').calledOnce).to.be.true;
      expect(setAttributeStub.withArgs('allowFullScreen', 'true').calledOnce).to.be.true;
      expect(setAttributeStub.withArgs('mozallowFullScreen', 'true').calledOnce).to.be.true;
      expect(setAttributeStub.withArgs('webkitAllowFullScreen', 'true').calledOnce).to.be.true;
      expect(iframeElement.id).to.equal('adtpub-frame-ad-container-id');
      expect(iframeElement.width).to.equal('value-width');
      expect(iframeElement.height).to.equal('value-height');
    });
  });

  describe('insertElementInAdContainer()', () => {
    let renderingManager;
    let getElementByIdStub;

    beforeEach(() => {
      renderingManager = getSubject({
        adContainerId: 'ad-container-id'
      });

      getElementByIdStub = sinon.stub(renderingManager.document, 'getElementById');
    });

    afterEach(() => {
      getElementByIdStub.reset();
    });

    it('should not insert element in the container if it is not found', () => {
      renderingManager.insertElementInAdContainer('element-for-insert');
      expect(getElementByIdStub.calledOnce).to.be.true;
    });

    it('should insert element in the container if it is found', () => {
      let element = {
        appendChild: () => {}
      };
      let appendChildSpy = sinon.spy(element, 'appendChild');
      getElementByIdStub.returns(element);

      renderingManager.insertElementInAdContainer('element-for-insert');
      expect(getElementByIdStub.calledOnce).to.be.true;
      expect(appendChildSpy.withArgs('element-for-insert').calledOnce).to.be.true;
    });
  });

  describe('prepareAdForIframe()', () => {
    it('should return undefined for undefined parameter', () => {
      let subject = getSubject();

      expect(subject.prepareAdForIframe()).to.be.undefined;
    });

    it('should return formatted frame content for existing ad', () => {
      let subject = getSubject();
      let adContent = '<some-ad-content/>';
      let expectedIframeContent = '<head><\/head><body><style></style>' + adContent + '<\/body>';

      expect(subject.prepareAdForIframe(adContent)).to.equal(expectedIframeContent);
    });
  });

  describe('render()', () => {
    let renderingManager;
    let createAdFrameStub;
    let insertElementStub;
    let populateIframeContentStub;
    let renderPixelsStub;

    beforeEach(() => {
      renderingManager = getSubject();
      createAdFrameStub = sinon.stub(renderingManager, 'createAdFrame');
      insertElementStub = sinon.stub(renderingManager, 'insertElementInAdContainer');
      populateIframeContentStub = sinon.stub(renderingManager, 'populateIframeContent');
      renderPixelsStub = sinon.stub(renderingManager, 'renderPixels');
    });

    afterEach(() => {
      createAdFrameStub.reset();
      insertElementStub.reset();
      populateIframeContentStub.reset();
      renderPixelsStub.reset();
    });

    it('should not call rendering methods when ad data is not present', () => {
      renderingManager.render();

      expect(insertElementStub.calledOnce).to.be.false;
      expect(populateIframeContentStub.calledOnce).to.be.false;
      expect(renderPixelsStub.calledOnce).to.be.false;
    });

    it('should call rendering methods when ad data is present', () => {
      createAdFrameStub.returns({});
      renderingManager.render();

      expect(insertElementStub.calledOnce).to.be.true;
      expect(populateIframeContentStub.calledOnce).to.be.true;
      expect(renderPixelsStub.calledOnce).to.be.true;
    });
  });

  describe('parsePixelsItems()', () => {
    it('should return empty for undefined parameter', () => {
      let subject = getSubject();

      expect(subject.parsePixelsItems()).to.be.empty;
    });

    it('should return empty for null parameter', () => {
      let subject = getSubject();

      expect(subject.parsePixelsItems(null)).to.be.empty;
    });

    it('should return parsed items when pixels are present', () => {
      let subject = getSubject();
      let pixels = '<script type="text/javascript">' +
        'document.write(\'<img src="url1.com">\');' +
        'document.write(\'' +
        '<iframe src="url2.com"></iframe>\');' +
        'document.write(\'' +
        '<img src="url3.com">\'); </script>';

      expect(subject.parsePixelsItems(pixels)).to.deep.equal([
        {tagName: 'IMG', src: 'url1.com'},
        {tagName: 'IFRAME', src: 'url2.com'},
        {tagName: 'IMG', src: 'url3.com'}
      ]);
    });
  });
});