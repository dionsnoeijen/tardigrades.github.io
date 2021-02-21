---
layout: docs
title: Choice field type
description: Field type configuration for the choice field type.
---

# Choice field type

The choice field provides a set of items a selection can be made from. Multiple or singular.

___

### Advanced

If you want to configure a Choice Field type manually, for your backend, this is an example:

`/config/{application}/{section}/field/educationLevel.yml`
{% highlight yml %}
field:
    name: Education level
    handle: educationLevel
    type: Choice
    form:
        all:
            label: Education level
            multiple: false
            required: true
            placeholder: choose_education_level
            choices:
                Elementary: elementary
                Middle School: middleSchool
                High School: highSchool
                University: university
    generator:
        entity:
            validator:
                NotBlank:
                    message: 'form_error_not_blank'
{% endhighlight %}
