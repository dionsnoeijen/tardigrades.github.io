class Slider {

    slider = null;
    sliderImages = null;
    sliderNav = null;
    sliderNavBlocks = [];
    toLeft = null;
    toRight = null;
    index = 0;
    id = null;
    boundSliders = [];

    constructor(id, boundSliders = []) {
        this.id = id;
        this.slider = document.querySelector(`${this.id}.slider`);
        this.sliderImages = document.querySelectorAll(`${this.id}.slider .slide`);
        this.boundSliders = boundSliders;

        this.toLeft = document.querySelector(`${this.id}.slider .to.left`);
        this.toRight = document.querySelector(`${this.id}.slider .to.right`);
        this.sliderNav = document.querySelector(`${this.id}.slider .slider-nav`);

        if (this.toLeft !== null) {
            this.toLeft.addEventListener('mousedown', this.onToLeft.bind(this));
        }
        if (this.toRight !== null) {
            this.toRight.addEventListener('mousedown', this.onToRight.bind(this));
        }
        this.navDown = this.onNavDown.bind(this);

        this.initializeSlider();
    }

    initializeSlider() {
        this.sliderImages[this.index].style.opacity = '1';
        this.sliderImages[this.index].style.left = '10%';
        this.slider.style.height = `${this.sliderImages[this.index].getBoundingClientRect().height}px`;

        if (this.sliderNav !== null) {
            for (let i = 0; i < this.sliderImages.length; i++) {
                const block = document.createElement('li');
                block.addEventListener('mousedown', this.navDown);
                const link = document.createElement('button');
                block.append(link);
                this.sliderNavBlocks.push(block);
                this.sliderNav.append(block);
            }
            this.sliderNavBlocks[0].style.opacity = '1';
        }
    }

    nextAndPrevIndex(index) {
        return {
            next: index === this.sliderImages.length-1 ? 0 : index+1,
            prev: index === 0 ? this.sliderImages.length-1 : index-1
        };
    }

    activateSliderNavBlock(index) {
        if (this.sliderNav !== null) {
            for (let i in this.sliderNavBlocks) {
                if (this.sliderNavBlocks.hasOwnProperty(i)) {
                    this.sliderNavBlocks[i].style.opacity = null;
                }
            }
            this.sliderNavBlocks[index].style.opacity = '1';
        }
    }

    onToLeft(time) {

        this.boundSliders.map(boundSlider => {
            boundSlider.onToLeft(time);
        });

        let transitionTime = '.3s';
        if (typeof time === 'number') {
            transitionTime = `${time}s`;
        }
        const nextPrev = this.nextAndPrevIndex(this.index);

        // Move prev into right position
        this.sliderImages[nextPrev.prev].style.transition = 'none';
        this.sliderImages[nextPrev.prev].style.left = '-100%';
        this.sliderImages[nextPrev.prev].style.opacity = '0';

        // Move current to left
        this.sliderImages[this.index].style.transition = `all ${transitionTime} ease`;
        this.sliderImages[this.index].style.left = '100%';
        this.sliderImages[this.index].style.opacity = '0';

        this.slider.style.height = `${this.sliderImages[nextPrev.prev].getBoundingClientRect().height}px`;

        // Move next to left
        setTimeout(() => {
            this.sliderImages[nextPrev.prev].style.transition = `all ${transitionTime} ease`;
            this.sliderImages[nextPrev.prev].style.left = '10%';
            this.sliderImages[nextPrev.prev].style.opacity = '1';
        });

        this.index--;
        if (this.index < 0) {
            this.index = this.sliderImages.length - 1;
        }
        this.activateSliderNavBlock(this.index);
    }

    onToRight(time) {

        this.boundSliders.map(boundSlider => {
            boundSlider.onToRight(time);
        });

        let transitionTime = '.3s';
        if (typeof time === 'number') {
            transitionTime = `${time}s`;
        }
        const nextPrev = this.nextAndPrevIndex(this.index);

        // Move next into left position
        this.sliderImages[nextPrev.next].style.transition = 'none';
        this.sliderImages[nextPrev.next].style.left = '100%';
        this.sliderImages[nextPrev.next].style.opacity = '0';

        // Move current to right
        this.sliderImages[this.index].style.transition = `all ${transitionTime} ease`;
        this.sliderImages[this.index].style.left = '-100%';
        this.sliderImages[this.index].style.opacity = '0';
        this.slider.style.height = `${this.sliderImages[nextPrev.next].getBoundingClientRect().height}px`;

        // Move next to left
        setTimeout(() => {
            this.sliderImages[nextPrev.next].style.transition = `all ${transitionTime} ease`;
            this.sliderImages[nextPrev.next].style.left = '10%';
            this.sliderImages[nextPrev.next].style.opacity = '1';
        });
        this.index++;
        if (this.index > this.sliderImages.length - 1) {
            this.index = 0;
        }
        this.activateSliderNavBlock(this.index);
    }

    onNavDown(event) {
        const targetIndex = this.sliderNavBlocks.indexOf(event.currentTarget);
        if (targetIndex > this.index) {
            // move right
            const times = targetIndex - this.index;
            for (let i = 0 ; i < times ; i++) {
                setTimeout(() => {
                    this.onToRight(.1);
                }, i * 100);
            }
        }
        if (targetIndex < this.index) {
            // move left
            const times = this.index - targetIndex;
            for (let i = 0 ; i < times ; i++) {
                setTimeout(() => {
                    this.onToLeft(.1);
                }, i * 100);
            }
        }
    }
}

window.addEventListener('load', () => {
    new Slider(
        '#hello-world-slider',
        [ new Slider('#hello-world-text-slider') ]
    );
    new Slider(
        '#read-slider',
        [ new Slider('#read-text-slider') ]
    );
});
